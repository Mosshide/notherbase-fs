import express from "express";
import bcrypt from "bcrypt";
import { check, success, successJSON, fail, loginCheck } from "./util.js";

/**
 * API routes for user functions.
 */
export default class User {
    constructor() {
        this.router = express.Router();

        this.router.post("/logout", this.logout);
        this.router.post("/changePassword", this.changePassword);
        this.router.post("/sendOTP", this.sendOneTimePassword);
        this.router.post("/changeEmail", this.changeEmail);
        this.router.post("/register", this.register);
        this.router.post("/login", this.login);
        this.router.post("/deletePermanently", this.deletePermanently);
        this.router.post("/getInfo", this.getInfo);
        this.router.post("/downloadData", this.downloadData);
        this.router.post("/deleteAlldata", this.deleteAlldata);
        this.router.post("/importData", this.importData);

    }

    /**
     * Logs the user out.
     * @param {Object} req An Express.js request.
     * @param {Object} res An Express.js response.
     */
    logout = async (req, res) => {
        if (loginCheck(req, res)) {
            delete req.user.memory?.data?.sessions[req.session.id];
            await req.user.commit();
            await req.session?.destroy();

            success(res, "Logged out.");
        }
    }

    /**
     * Change a user's password.
     * @param {Object} req An Express.js request.
     * @param {Object} res An Express.js response.
     */
    changePassword = async (req, res) => {
        if (loginCheck(req, res)) {
            let spirit = await req.db.Spirit.recallOne("user",  null, { username: req.session.currentUser });  

            if (check(res, spirit, "User not found!") &&
                check(res, req.body.newPassword === req.body.confirmation, "New password and confirmation must match!") &&
                check(res, req.body.oldPassword != req.body.newPassword, "New password must be different from the old one."))
            {
                let passResult = await bcrypt.compare(req.body.oldPassword, spirit.memory.data.password);

                if (check(res, passResult, "Old password incorrect.")) {
                    const salt = await bcrypt.genSalt(10);
                    const hash = await bcrypt.hash(req.body.newPassword, salt);
    
                    spirit.addBackup({
                        ...spirit.memory.data,
                        password: hash
                    });
                    
                    await spirit.commit();
            
                    success(res, "Password changed successfully!");
                }
            }
        }
    }

    validatePassword = async (req, password, user) => {
        if (password && user?.memory?.data?.otp) {
            if (password == user.memory.data.otp.code) {
                if (Date.now() < user.memory.data.otp.expires) {
                    user.memory.data.otp.expires = 0;
                    await user.commit();
                    return "Authenticated.";
                }
                else return "One-time password expired.";
            }
            else {
                let passResult = await bcrypt.compare(req.body.password, user.memory.data.password);
                if (passResult) return "Authenticated.";
                else return "Password doesn't match the username.";
            }
        }
        else return "Password error.";
    }

    /**
     * Change a user's email.
     * @param {Object} req An Express.js request.
     * @param {Object} res An Express.js response.
     */
    changeEmail = async (req, res) => {       
        if (loginCheck(req, res)) {
            let spirit = await req.db.Spirit.recallOne("user",  null, { username: req.session.currentUser });  

            if (check(res, spirit, "User not found!") &&
                check(res, req.body.email, "New email must be provided."))
            {
                let result = await this.validatePassword(req, req.body.password, spirit);
                if (result == "Authenticated.") {
                    let other = await req.db.Spirit.recallOne("user",  null, { email: req.body.email });
         
                    if (check(res, !other, "Email already in use!")) {
                        spirit.addBackup({
                            ...spirit.memory.data,
                            email: req.body.email
                        });
                        
                        await spirit.commit();
                
                        success(res, "Email changed successfully!");
                    }
                }
                else fail(res, result);
            }
        }
    }

    /**
     * Send a one-time password to the user's email.
     * @param {Object} req An Express.js request.
     * @param {Object} res An Express.js response.
     */
    sendOneTimePassword = async (req, res) => {
        if (loginCheck(req, res)) {
            let spirit = await req.db.Spirit.recallOne("user",  null, { username: req.session.currentUser });  

            if (check(res, spirit, "User not found!")) {
                let otp = Math.floor(100000 + Math.random() * 900000);
                spirit.memory.data.otp = {
                    code: otp,
                    expires: Date.now() + 1000 * 60 * 15
                }
                
                await spirit.commit();

                await req.db.SendMail.send(spirit.memory.data.email, 'One Time Password for NotherBase', 
                    `<h1>Your One-Time Password:<h1>
                    <h2>${otp}<h2>
                    <p>Visit <a href="https://www.notherbase.com/the-front/keeper">notherbase.com/the-front/keeper</a> to use your one-time password.</p>
                    <p>This one-time password expires in 15 minutes.<p>`);
        
                success(res, "One-time password sent.");
            }
        }
    }

    /**
     * Register a new user account.
     * @param {Object} req An Express.js request.
     * @param {Object} res An Express.js response.
     */
    register = async (req, res) => {
        if (check(res, req.body.password.length > 10, "Password must be >10 characters long.") &&
            check(res, req.body.username.length > 2, "Username too short.")) 
        {
            let spirit = await req.db.Spirit.recallOne("user",  null, { username: req.body.username });
    
            if (check(res, !spirit, "Username already in use!")) {
                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash(req.body.password, salt);

                spirit = await req.db.Spirit.create("user", { 
                    username: req.body.username, 
                    password: hash,
                    authLevels: [ "Basic" ],
                    view: "compact",
                    email: "",
                    otp: {
                        code: "",
                        expires: 0
                    },
                    sessions: {}
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
        let spirit = await req.db.Spirit.recallOne("user",  null, { username: req.body.username });
        if (check(res, spirit, "User not found.")) {
            spirit.memory.data = {
                username: "", 
                password: "",
                authLevels: [ "Basic" ],
                view: "compact",
                email: "",
                otp: {
                    code: "",
                    expires: 0
                },
                sessions: {},
                ...spirit.memory.data
            }
            await spirit.commit();
            
            let result = await this.validatePassword(req, req.body.password, spirit);
            if (result === "Authenticated.") {
                req.session.currentUser = req.body.username;
                if (typeof spirit.memory.data.sessions !== "object" || Array.isArray(spirit.memory.data.sessions)) spirit.memory.data.sessions = {};
                spirit.memory.data.sessions[req.session.id] = Date.now() + 1000 * 60 * 60 * 24 * 28; // 28 days 
                await spirit.commit();
                success(res, "Login successful!", req.body.username);
            }
            else fail(res, result);
        }
    }

    /**
     * Deletes a user account premanently.
     * @param {Object} req An Express.js request.
     * @param {Object} res An Express.js response.
     */
    deletePermanently = async (req, res) => {
        if (loginCheck(req, res)) {
            let spirit = await req.db.Spirit.recallOne("user",  null, { username: req.session.currentUser });

            if (check(res, spirit, "User not found.")) {
                let passResult = await bcrypt.compare(req.body.password, spirit.memory.data.password);

                if (check(res, passResult, "Password doesn't match the username.")) {
                    let deleted = await req.db.Spirit.delete("user",  null, { username: req.session.currentUser });
            
                    if (check(res, deleted > 0, "No account deleted")) {
                        await req.session.destroy();
                
                        success(res, "Account deleted.");
                    }
                }
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
            let user = await req.db.Spirit.recallOne("user",  null, { username: req.session.currentUser });
    
            if (check(res, user, "Account not found!")) {
                success(res, "Info found", {
                    username: user.memory.data.username
                });
            }
        }
    }

    //download all spirit data belonging to the user
    downloadData = async (req, res) => {
        if (loginCheck(req, res)) {
            let user = await req.db.Spirit.recallOne("user",  null, { username: req.session.currentUser });

            if (check(res, user, "Account not found!")) {
                let data = await req.db.Spirit.recallAll(null, user.memory._id);
                let dataToDownload = data.map(d => d.memory);

                successJSON(res, "Data Downloaded", dataToDownload);
            }
        }
    }

    //delete all spirit data belonging to the user
    deleteAlldata = async (req, res) => {
        if (loginCheck(req, res)) {
            let user = await req.db.Spirit.recallOne("user",  null, { username: req.session.currentUser });

            if (check(res, user, "Account not found!")) {
                if (check(res, req.body.password, "Password error.")) {
                    let passResult = await bcrypt.compare(req.body.password, user.memory.data.password);

                    if (check(res, passResult, "Password doesn't match the username.")) {
                        let deleted = await req.db.Spirit.delete(null, user.memory._id);
                        if (check(res, deleted > 0, "No data deleted")) {
                            success(res, "Data Deleted", deleted);
                        }
                    }
                }
            }
        }
    }

    // import spirit data from a JSON file
    importData = async (req, res) => {
        if (loginCheck(req, res)) {
            let user = await req.db.Spirit.recallOne("user",  null, { username: req.session.currentUser }); 

            if (check(res, user, "Account not found!")) {
                if (check(res, req.body.password, "Password error.")) {
                    let passResult = await bcrypt.compare(req.body.password, user.memory.data.password);

                    if (check(res, passResult, "Password doesn't match the username.")) {
                        let data = JSON.parse(req.body.data);
                        let imported = 0;
                        for (let i = 0; i < data.length; i++) {
                            if (data[i].parent != null) {
                                let spirit = await req.db.Spirit.create(data[i].service, data[i].data, user.memory._id);
                                if (spirit) imported++;
                            }
                        }

                        success(res, "Data Imported", imported);
                    }
                }
            }
        }
    }
}