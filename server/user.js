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
        try {
            if (loginCheck(req, res)) {
                delete req.user?.data?.sessions[req.session.id];
                await req.user.commit();
                await req.session?.destroy();

                success(res, "Logged out.");
            }
        } catch (error) {
            console.log(error);
            fail(res, "Server error");
        }
    }

    /**
     * Change a user's password.
     * @param {Object} req An Express.js request.
     * @param {Object} res An Express.js response.
     */
    changePassword = async (req, res) => {
        try {
            if (loginCheck(req, res)) {
                let spirit = await req.Spirit.findOne({ service: "user", "data.username": req.session.currentUser });  
                console.log(spirit);
                

                if (check(res, spirit, "User not found!") &&
                    check(res, req.body.newPassword === req.body.confirmation, "New password and confirmation must match!") &&
                    check(res, req.body.oldPassword != req.body.newPassword, "New password must be different from the old one."))
                {
                    let passResult = await bcrypt.compare(req.body.oldPassword, spirit.data.password);

                    if (check(res, passResult, "Old password incorrect.")) {
                        const salt = await bcrypt.genSalt(10);
                        const hash = await bcrypt.hash(req.body.newPassword, salt);
        
                        spirit.data.password = hash;                    
                        await spirit.commit();
                
                        success(res, "Password changed successfully!");
                    }
                }
            }
        } catch (error) {
            console.log(error);
            fail(res, "Server error");
        }
    }

    validatePassword = async (req, password, user) => {
        try {
            if (password && user?.data?.otp) {
                if (password == user.data.otp.code) {
                    if (Date.now() < user.data.otp.expires) {
                        user.data.otp.expires = 0;
                        await user.commit();
                        return "Authenticated.";
                    }
                    else return "One-time password expired.";
                }
                else {
                    let passResult = await bcrypt.compare(req.body.password, user.data.password);
                    if (passResult) return "Authenticated.";
                    else return "Password doesn't match the username.";
                }
            }
            else return "Password error.";
        } catch (error) {
            console.log(error);
            fail(res, "Server error");
        }
    }

    /**
     * Change a user's email.
     * @param {Object} req An Express.js request.
     * @param {Object} res An Express.js response.
     */
    changeEmail = async (req, res) => {       
        try {
            if (loginCheck(req, res)) {
                let spirit = await req.Spirit.findOne({ service: "user", "data.username": req.session.currentUser }); 

                if (check(res, spirit, "User not found!") &&
                    check(res, req.body.email, "New email must be provided."))
                {
                    let result = await this.validatePassword(req, req.body.password, spirit);
                    if (result == "Authenticated.") {
                        let other = await req.Spirit.findOne({ service: "user", "data.email": req.body.email });
            
                        if (check(res, !other, "Email already in use!")) {
                            spirit.data.email = req.body.email;                        
                            await spirit.commit();
                    
                            success(res, "Email changed successfully!");
                        }
                    }
                    else fail(res, result);
                }
            }
        } catch (error) {
            console.log(error);
            fail(res, "Server error");
        }
    }

    /**
     * Send a one-time password to the user's email.
     * @param {Object} req An Express.js request.
     * @param {Object} res An Express.js response.
     */
    sendOneTimePassword = async (req, res) => {
        try {
            if (loginCheck(req, res)) {
                let spirit = await req.Spirit.findOne({ service: "user", "data.username": req.session.currentUser }); 

                if (check(res, spirit, "User not found!")) {
                    let otp = Math.floor(100000 + Math.random() * 900000);
                    spirit.data.otp = {
                        code: otp,
                        expires: Date.now() + 1000 * 60 * 15
                    }
                    
                    await spirit.commit();

                    await req.SendMail.send(spirit.data.email, 'One Time Password for NotherBase', 
                        `<h1>Your One-Time Password:<h1>
                        <h2>${otp}<h2>
                        <p>Visit <a href="https://www.notherbase.com/the-front/keeper">notherbase.com/the-front/keeper</a> to use your one-time password.</p>
                        <p>This one-time password expires in 15 minutes.<p>`);
            
                    success(res, "One-time password sent.");
                }
            }
        } catch (error) {
            console.log(error);
            fail(res, "Server error");
        }
    }

    /**
     * Register a new user account.
     * @param {Object} req An Express.js request.
     * @param {Object} res An Express.js response.
     */
    register = async (req, res) => {
        try {
            if (check(res, req.body.password.length > 10, "Password must be >10 characters long.") &&
                check(res, req.body.username.length > 2, "Username too short.")) 
            {
                let spirit = await req.Spirit.findOne({ service: "user", "data.username": req.body.username });
        
                if (check(res, !spirit, "Username already in use!")) {
                    const salt = await bcrypt.genSalt(10);
                    const hash = await bcrypt.hash(req.body.password, salt);

                    spirit = new req.Spirit({ 
                        service:"user", 
                        _lastUpdate: Date.now(),
                        data: { 
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
                        },
                        backups: []
                    });
                    await spirit.save();
            
                    success(res, "Registration successful!");
                }
            }
        } catch (error) {
            console.log(error);
            fail(res, "Server error");
        }
    }

    /**
     * Logs a user in.
     * @param {Object} req An Express.js request.
     * @param {Object} res An Express.js response.
     */
    login = async (req, res) => {
        try {
            let spirit = await req.Spirit.findOne({ service: "user", "data.username": req.body.username });
            if (check(res, spirit, "User not found.")) {
                spirit.data = {
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
                    ...spirit.data
                }
                await spirit.commit();
                
                let result = await this.validatePassword(req, req.body.password, spirit);
                if (result === "Authenticated.") {
                    req.session.currentUser = req.body.username;
                    if (typeof spirit.data.sessions !== "object" || Array.isArray(spirit.data.sessions)) spirit.data.sessions = {};
                    spirit.data.sessions[req.session.id] = Date.now() + 1000 * 60 * 60 * 24 * 28; // 28 days 
                    await spirit.commit();
                    success(res, "Login successful!", req.body.username);
                }
                else fail(res, result);
            }
        } catch (error) {
            console.log(error);
            fail(res, "Server error");
        }
    }

    /**
     * Deletes a user account premanently.
     * @param {Object} req An Express.js request.
     * @param {Object} res An Express.js response.
     */
    deletePermanently = async (req, res) => {
        try {
            if (loginCheck(req, res)) {
                let spirit = await req.Spirit.findOne({ service: "user", "data.username": req.session.currentUser });

                if (check(res, spirit, "User not found.")) {
                    let passResult = await bcrypt.compare(req.body.password, spirit.data.password);

                    if (check(res, passResult, "Password doesn't match the username.")) {
                        let deleted = await req.Spirit.deleteMany({ service: "user", "data.username": req.session.currentUser });
                
                        if (check(res, deleted > 0, "No account deleted")) {
                            await req.session.destroy();
                    
                            success(res, "Account deleted.");
                        }
                    }
                }
            }
        } catch (error) {
            console.log(error);
            fail(res, "Server error");
        }
    }

    /**
     * Gets basic account information.
     * @param {Object} req An Express.js request.
     * @param {Object} res An Express.js response.
     */
    getInfo = async (req, res) => {
        try {
            if (loginCheck(req, res)) {
                let user = await req.Spirit.findOne({ service: "user", "data.username": req.session.currentUser }); 
        
                if (check(res, user, "Account not found!")) {
                    success(res, "Info found", {
                        username: user.data.username
                    });
                }
            }
        } catch (error) {
            console.log(error);
            fail(res, "Server error");
        }
    }

    //download all spirit data belonging to the user
    downloadData = async (req, res) => {
        try {
            if (loginCheck(req, res)) {
                let user = await req.Spirit.findOne({ service: "user", "data.username": req.session.currentUser }); 

                if (check(res, user, "Account not found!")) {
                    let data = await req.Spirit.find({ parent: user._id });
                    let dataToDownload = data.map(d => d);

                    successJSON(res, "Data Downloaded", dataToDownload);
                }
            }
        } catch (error) {
            console.log(error);
            fail(res, "Server error");
        }
    }

    //delete all spirit data belonging to the user
    deleteAlldata = async (req, res) => {
        try {
            if (loginCheck(req, res)) {
                let user = await req.Spirit.findOne({ service: "user", "data.username": req.session.currentUser }); 

                if (check(res, user, "Account not found!")) {
                    if (check(res, req.body.password, "Password error.")) {
                        let passResult = await bcrypt.compare(req.body.password, user.data.password);

                        if (check(res, passResult, "Password doesn't match the username.")) {
                            let deleted = await req.Spirit.deleteMany({ parent: user._id });
                            if (check(res, deleted > 0, "No data deleted")) {
                                success(res, "Data Deleted", deleted);
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.log(error);
            fail(res, "Server error");
        }
    }

    // import spirit data from a JSON file
    importData = async (req, res) => {
        try {
            if (loginCheck(req, res)) {
                let user = await req.Spirit.findOne({ service: "user", "data.username": req.session.currentUser }); 

                if (check(res, user, "Account not found!")) {
                    if (check(res, req.body.password, "Password error.")) {
                        let passResult = await bcrypt.compare(req.body.password, user.data.password);

                        if (check(res, passResult, "Password doesn't match the username.")) {
                            let data = JSON.parse(req.body.data);
                            let imported = 0;
                            for (let i = 0; i < data.length; i++) {
                                if (data[i].parent != null) {
                                    let spirit = new req.Spirit({ 
                                        service: data[i].service, 
                                        _lastUpdate: data[i]._lastUpdate,
                                        data: data[i].data, 
                                        parent: user._id,
                                        backups: data[i].backups || []
                                    });
                                    await spirit.save();
                                    if (spirit) imported++;
                                }
                            }

                            success(res, "Data Imported", imported);
                        }
                    }
                }
            }
        } catch (error) {
            console.log(error);
            fail(res, "Server error");
        }
    }
}