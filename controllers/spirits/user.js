import express from "express";
import bcrypt from "bcrypt";
import { check, success, fail, loginCheck } from "./util.js";

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
        this.router.post("/getInventory", this.getInventory);
        this.router.post("/getAttributes", this.getAttributes);
    }

    logout = async (req, res) => {
        await req.session.destroy();

        success(res, "Logged out.");
    }

    sendPasswordReset = async (req, res) => {
        let spirit = await req.db.User.recallOne(req.body.data.email);

        if (spirit) {
            let token = Math.floor(Math.random() * 9999);

            if (req.body.data.test) console.log("token: " + token);

            spirit.memory.data.resetToken = token;
            spirit.memory.data.resetExp = Date.now() + (1000 * 60 * 10);
            await spirit.commit();
    
            req.db.SendMail.passwordReset(req.body.data.email, token);
    
            success(res, "Password reset token sent.");
        }
        else fail(res, "User not found.");
    }

    changePassword = async (req, res) => {
        if (check(res, req.body.data.token, "No token provided!")){
            let spirit = await req.db.User.recallOne(req.body.data.email);
    
            if (check(res, spirit, "User not found!") &&
                check(res, spirit.memory.data.resetToken == req.body.data.token, "Reset token not valid!") &&
                check(res, spirit.memory.data.resetExp > Date.now(), "Reset token expired!") &&
                check(res, req.body.data.password === req.body.data.confirmation, "Passwords must match!")) 
            {
                spirit.memory.data.resetExp = -1;
        
                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash(req.body.data.password, salt);
        
                spirit.memory.data.password = hash;
                await spirit.commit();
        
                success(res, "Password changed successfully!");
            }
        }
    }

    register = async (req, res) => {
        if (check(res, req.body.data.password.length > 7, "Password too short.") &&
            check(res, req.body.data.email.length > 7, "Email too short.") &&
            check(res, req.body.data.username.length > 2, "Username too short.")) 
        {
            let spirit = await req.db.User.recallOne(req.body.data.email);
    
            if (check(res, !spirit, "Email already in use!")) {
                spirit = await req.db.User.create(req.body.data.username, req.body.data.password, req.body.data.email);
        
                success(res, "Registration successful!");
            }
        }
    }

    login = async (req, res) => {
        let spirit = await req.db.User.recallOne(req.body.data.email);
        if (check(res, spirit, "User not found.")) {
            let passResult = await bcrypt.compare(req.body.data.password, spirit.memory.data.password);
            
            if (check(res, passResult, "Password doesn't match the email.")) {
                req.session.currentUser = req.body.data.email;
        
                success(res, "Logged in.", spirit.memory.data.username);
            }
        }
    }

    changeEmail = async (req, res) => {
        if (loginCheck(req, res)) {
            let spirit = await req.db.User.recallOne(req.body.data.email);
    
            if (check(res, !spirit, "Email already in use!")) {
                spirit = await req.db.User.recallOne(req.session.currentUser);
        
                spirit.memory.data.email = req.body.data.email;
                await spirit.commit();
        
                req.session.currentUser = req.body.data.email;
        
                success(res, "Email changed.");
            }
        }
    }

    changeUsername = async (req, res) => {
        if (loginCheck(req, res)) {
            let spirit = await req.db.User.recallOne(null, req.body.data.username);
    
            if (check(res, !spirit, "Username already in use!")) {
                spirit = await req.db.User.recallOne(req.session.currentUser);
        
                spirit.memory.data.username = req.body.data.username;
                await spirit.commit();
        
                success(res, "Username changed");
            }
        }
    }

    deletePermanently = async (req, res) => {
        if (loginCheck(req, res)) {
            let deleted = await req.db.User.delete(req.session.currentUser);
    
            if (check(res, deleted > 0, "No account deleted")) {
                await req.session.destroy();
        
                success(res, "Account deleted.");
            }
        }
    }

    getInventory = async (req, res) => {
        if (loginCheck(req, res)) {
            let spirit = await req.db.User.recallOne(req.session.currentUser);
            if (spirit.memory._lastUpdate > req.body._lastUpdate) {
                let inv = spirit.memory.data.inventory;
            
                success(res, "Inventory found", inv, spirit.memory._lastUpdate);
            }
            else fail(res, "Inventory up to date.");
        }
    }

    getAttributes = async (req, res) => {
        if (loginCheck(req, res)) {
            let user = await req.db.User.recallOne(req.session.currentUser);
    
            if (user.memory._lastUpdate > req.body._lastUpdate) {
                success(res, "Attributes found", user.memory.data.attributes);
            }
            else fail(res, "Attributes up to date.");
        }
    }
}