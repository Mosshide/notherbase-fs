import express from "express";
import bcrypt from "bcrypt";
import { check, success, fail, loginCheck } from "./util.js";

/**
 * API routes for user functions.
 */
export default class User {
    constructor() {
        this.router = express.Router();

        this.router.post("/logout", this.logout);
        this.router.post("/sendPasswordReset", this.sendPasswordReset);
        this.router.post("/changePassword", this.changePassword);
        this.router.post("/register", this.register);
        this.router.post("/login", this.login);
        this.router.post("/changeEmail", this.changeEmail);
        this.router.post("/changeUsername", this.changeUsername);
        this.router.post("/deletePermanently", this.deletePermanently);
        this.router.post("/getInfo", this.getInfo);
        this.router.post("/getView", this.getView);
        this.router.post("/setView", this.setView);
    }

    /**
     * Logs the user out.
     * @param {Object} req An Express.js request.
     * @param {Object} res An Express.js response.
     */
    logout = async (req, res) => {
        await req.session.destroy();

        success(res, "Logged out.");
    }

    /**
     * Sends an email with a password reset code.
     * @param {Object} req An Express.js request.
     * @param {Object} res An Express.js response.
     */
    sendPasswordReset = async (req, res) => {
        let spirit = await req.db.Spirit.recallOne("user",  null, { email: req.body.email });

        if (spirit) {
            let token = Math.floor(Math.random() * 9999);

            spirit.memory.data.resetToken = token;
            spirit.memory.data.resetExp = Date.now() + (1000 * 60 * 10);
            await spirit.commit();
    
            if (req.body.test) console.log("token: " + token);
            else req.db.SendMail.passwordReset(req.body.email, token);
    
            success(res, "Password reset token sent.");
        }
        else fail(res, "User not found.");
    }

    /**
     * Change a user's password.
     * @param {Object} req An Express.js request.
     * @param {Object} res An Express.js response.
     */
    changePassword = async (req, res) => {
        if (check(res, req.body.token, "No token provided!")){
            let spirit = await req.db.Spirit.recallOne("user",  null, { email: req.body.email });
    
            if (check(res, spirit, "User not found!") &&
                check(res, spirit.memory.data.resetToken == req.body.token, "Reset token not valid!") &&
                check(res, spirit.memory.data.resetExp > Date.now(), "Reset token expired!") &&
                check(res, req.body.password === req.body.confirmation, "Passwords must match!")) 
            {
                spirit.memory.data.resetExp = -1;
        
                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash(req.body.password, salt);
        
                spirit.memory.data.password = hash;
                spirit.addBackup({
                    ...spirit.memory.data,
                    password: hash
                });
                
                await spirit.commit();
        
                success(res, "Password changed successfully!");
            }
        }
    }

    /**
     * Register a new user account.
     * @param {Object} req An Express.js request.
     * @param {Object} res An Express.js response.
     */
    register = async (req, res) => {
        if (check(res, req.body.password.length > 7, "Password too short.") &&
            check(res, req.body.email.length > 7, "Email too short.") &&
            check(res, req.body.username.length > 2, "Username too short.")) 
        {
            let spirit = await req.db.Spirit.recallOne("user",  null, { email: req.body.email });
    
            if (check(res, !spirit, "Email already in use!")) {
                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash(req.body.password, salt);

                spirit = await req.db.Spirit.create("user", { 
                    username: req.body.username, 
                    email: req.body.email,
                    password: hash,
                    resetToken: null,
                    resetExp: null,
                    coin: 0,
                    home: "/",
                    authLevels: [ "Basic" ],
                    location: "/the-front",
                    attributes: {
                        translation: 0,
                        strength: 0,
                        agility: 0,
                        defense: 0
                    },
                    inventory: []
                });
        
                success(res, "Registration successful!");
            }
        }
    }

    /**
     * Logs a user in.
     * @param {Object} req An Express.js request.
     * @param {Object} res An Express.js response.
     */
    login = async (req, res) => {
        let spirit = await req.db.Spirit.recallOne("user",  null, { email: req.body.email });

        if (check(res, spirit, "User not found.")) {
            let passResult = await bcrypt.compare(req.body.password, spirit.memory.data.password);
            
            if (check(res, passResult, "Password doesn't match the email.")) {
                req.session.currentUser = req.body.email;
        
                success(res, "Logged in.", spirit.memory.data.username);
            }
        }
    }

    /**
     * Changes a user's email address on file.
     * @param {Object} req An Express.js request.
     * @param {Object} res An Express.js response.
     */
    changeEmail = async (req, res) => {
        if (loginCheck(req, res)) {
            let spirit = await req.db.Spirit.recallOne("user",  null, { email: req.body.email });
    
            if (check(res, !spirit, "Email already in use!")) {
                spirit = await req.db.Spirit.recallOne("user",  null, { email: req.session.currentUser });
        
                spirit.memory.data.email = req.body.email;
                await spirit.commit();
        
                req.session.currentUser = req.body.email;
        
                success(res, "Email changed.");
            }
        }
    }

    /**
     * Changes a user's display name.
     * @param {Object} req An Express.js request.
     * @param {Object} res An Express.js response.
     */
    changeUsername = async (req, res) => {
        if (loginCheck(req, res)) {
            let spirit = await req.db.Spirit.recallOne("user",  null, { username: req.body.username });
    
            if (check(res, !spirit, "Username already in use!")) {
                spirit = await req.db.Spirit.recallOne("user",  null, { email: req.session.currentUser });
        
                spirit.memory.data.username = req.body.username;
                await spirit.commit();
        
                success(res, "Username changed");
            }
        }
    }

    /**
     * Deletes a user account premanently.
     * @param {Object} req An Express.js request.
     * @param {Object} res An Express.js response.
     */
    deletePermanently = async (req, res) => {
        if (loginCheck(req, res)) {
            let deleted = await req.db.Spirit.delete("user",  null, { email: req.session.currentUser });
    
            if (check(res, deleted > 0, "No account deleted")) {
                await req.session.destroy();
        
                success(res, "Account deleted.");
            }
        }
    }

    /**
     * Gets basic account information.
     * @param {Object} req An Express.js request.
     * @param {Object} res An Express.js response.
     */
    getInfo = async (req, res) => {
        if (loginCheck(req, res)) {
            let user = await req.db.Spirit.recallOne("user",  null, { email: req.session.currentUser });
    
            if (check(res, user, "Account not found!")) {
                if (check(res, user.memory._lastUpdate > req.body._lastUpdate, "Info up to date.")) {
                    success(res, "Info found", {
                        email: user.memory.data.email,
                        username: user.memory.data.username
                    });
                }
            }
        }
    }

    /**
     * Gets a user's saved view state.
     */
    getView = async (req, res) => {
        if (loginCheck(req, res)) {
            let user = await req.db.Spirit.recallOne("user",  null, { email: req.session.currentUser });

            if (check(res, user, "Account not found!")) {
                success(res, "View found", user.memory.data.view);
            }
        }
    }

    /**
     * Sets a user's view state.
     */
    setView = async (req, res) => {
        if (loginCheck(req, res)) {
            let user = await req.db.Spirit.recallOne("user",  null, { email: req.session.currentUser });

            if (check(res, user, "Account not found!")) {
                user.memory.data.view = req.body.view;
                await user.commit();

                success(res, "View set");
            }
        }
    }
}