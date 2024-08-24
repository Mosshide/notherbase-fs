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
        this.router.post("/register", this.register);
        this.router.post("/login", this.login);
        this.router.post("/deletePermanently", this.deletePermanently);
        this.router.post("/getInfo", this.getInfo);
        this.router.post("/getView", this.getView);
        this.router.post("/setView", this.setView);
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
        await req.session.destroy();

        success(res, "Logged out.");
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
                    view: "compact"
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
            let passResult = await bcrypt.compare(req.body.password, spirit.memory.data.password);
            
            if (check(res, passResult, "Password doesn't match the username.")) {
                req.session.currentUser = req.body.username;
                
                success(res, "Logged in.", req.body.username);
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

    /**
     * Gets a user's saved view state.
     */
    getView = async (req, res) => {
        if (loginCheck(req, res)) {
            let user = await req.db.Spirit.recallOne("user",  null, { username: req.session.currentUser });

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
            let user = await req.db.Spirit.recallOne("user",  null, { username: req.session.currentUser });

            if (check(res, user, "Account not found!")) {
                user.memory.data.view = req.body.view == "compact" ? "compact" : "full";
                await user.commit();

                success(res, "View set");
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
                dataToDownload.unshift(user.memory.data);

                successJSON(res, "Data Downloaded", dataToDownload);
            }
        }
    }

    //delete all spirit data belonging to the user
    deleteAlldata = async (req, res) => {
        if (loginCheck(req, res)) {
            let user = await req.db.Spirit.recallOne("user",  null, { username: req.session.currentUser });

            if (check(res, user, "Account not found!")) {
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

    // import spirit data from a JSON file
    importData = async (req, res) => {
        if (loginCheck(req, res)) {
            let user = await req.db.Spirit.recallOne("user",  null, { username: req.session.currentUser }); 

            if (check(res, user, "Account not found!")) {
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