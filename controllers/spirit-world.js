import express from "express";
import { stripHtml } from "string-strip-html";
import { success, fail } from "./util.js";
import User from "./user.js";
import fs from 'fs';

/**
* The spirit world is the API of a base.
*/
export default class SpiritWorld {
    /**
     * Sets up socket.io for instant messaging and etc.
     * @param {*} socket 
     */
    #setupChat = (socket) => {
        socket.join(socket.handshake.query.room);
    
        this.io.to(socket.handshake.query.room).emit("chat message", {
            name: "Server",
            time: Date.now(),
            text: `${socket.handshake.query.name} has joined the room.`
        });
    
        socket.on("chat message", (msg) => {
            this.io.to(socket.handshake.query.room).emit("chat message", {
                name: msg.name,
                time: msg.time,
                text: stripHtml(msg.text).result
            });
        });
    
        socket.on('disconnect', () => {
            this.io.to(socket.handshake.query.room).emit("chat message", {
                name: "Server",
                time: Date.now(),
                text: `${socket.handshake.query.name} has left the room.`
            });
        });
    }

    /**
     * Sets up the spirit world.
     * @param {Server} io 
     */
    constructor(io) {
        this.io = io;
        this.router = express.Router();
        this.user = new User();

        this.router.post("/load", this.load);
        this.router.post("/serve", this.serve);
        this.router.use("/user", this.user.router);

        this.io.on('connection', this.#setupChat);
    }

    /**
     * This API route requests a spirit from the database.
     * @param {Object} req 
     * @param {Object} res 
     */
    load = async (req, res) => {
        try {
            let parent = null;

            if (req.body.scope === "local") {
                let user = await req.db.User.recallOne(req.session.currentUser);
                if (user?.id) parent = user.id;
                else throw new Error("User had no id on load(): ", user);
            } 

            let spirit = await req.db.Spirit.recallOne(req.body.service, parent);

            res.send(spirit.memory.data ? spirit.memory.data : {});
        } catch (error) {
            console.log(error);
            fail(res, "Server error");
        }
    }

    /**
     * This API route runs a script on the server. Responds with the result.
     * @param {Object} req 
     * @param {Object} res 
     */
    serve = async (req, res) => {
        try {
            let scriptPath = `${req.contentPath}${req.body.route}/${req.body.script}.js`;
            
            let script, result = null;

            if (fs.existsSync(scriptPath)) {
                let user = await req.db.User.recallOne(req.session.currentUser);

                script = await import(scriptPath);
                result = await script.default(req, user);
                success(res, "Served.", result);
            }
            else fail(res, `Script not found: ${req.body.script} at ${scriptPath}`);
        } catch (error) {
            console.log(error);
            fail(res, "Server error");
        }
    }
}