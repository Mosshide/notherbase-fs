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
     * Sets up the spirit world.
     * @param {Server} io 
     */
    constructor(io) {
        this.io = io;
        this.rooms = {};

        this.router = express.Router();
        this.user = new User();

        this.router.post("/loadAll", this.loadAll);
        this.router.post("/load", this.load);
        this.router.post("/serve", this.serve);
        this.router.use("/user", this.user.router);

        this.io.on('connection', this.#setupChat);
    }

    /**
     * Sets up socket.io for instant messaging and etc.
     * @param {*} socket 
     */
    #setupChat = (socket) => {
        socket.join(socket.handshake.query.room);
        if (this.rooms[socket.handshake.query.room]) this.rooms[socket.handshake.query.room].users.push(socket.handshake.query.name);
        else {
            this.rooms[socket.handshake.query.room] = {
                users: [
                    socket.handshake.query.name
                ]
            }
        }
    
        this.io.to(socket.handshake.query.room).emit("chat message", {
            name: "Server",
            time: Date.now(),
            text: `${socket.handshake.query.name} has joined the room.`
        });

        this.io.to(socket.handshake.query.room).emit("chat info", {
            name: socket.handshake.query.room,
            time: Date.now(),
            data: {
                users: this.rooms[socket.handshake.query.room].users
            }
        });
    
        socket.on("chat message", (msg) => {
            this.io.to(socket.handshake.query.room).emit("chat message", {
                name: msg.name,
                time: msg.time,
                text: stripHtml(msg.text).result
            });
        });
    
        socket.on('disconnect', () => {
            this.rooms[socket.handshake.query.room].users.splice(this.rooms[socket.handshake.query.room].users.indexOf(socket.handshake.query.name));

            this.io.to(socket.handshake.query.room).emit("chat message", {
                name: "Server",
                time: Date.now(),
                text: `${socket.handshake.query.name} has left the room.`
            });

            this.io.to(socket.handshake.query.room).emit("chat info", {
                name: socket.handshake.query.room,
                time: Date.now(),
                data: {
                    users: this.rooms[socket.handshake.query.room].users
                }
            });

            if (this.rooms[socket.handshake.query.room].users.length < 1) delete this.rooms[socket.handshake.query.room];
        });
    }

    /**
     * This API route requests all spirits of a kind from the database.
     * @param {Object} req
     * @param {Object} res
     * @returns {Object} The requested spirits.
     */
    loadAll = async (req, res) => {
        try {
            let parent = null;
            let data = req.body.data ? req.body.data : {};
            let id = req.body.id ? req.body.id : null;

            // if the scope is local, the parent is the user's id
            if (req.body.scope === "local") {
                let user = await req.db.Spirit.recallOne("user",  null, { email: req.session.currentUser });
                if (user?.memory?._id) parent = user.memory._id;
                else {
                    fail(res, "User had no id on load()");
                    return;
                }
            } 

            // recall all spirits with the given service name and parent
            let spirits = await req.db.Spirit.recallAll(req.body.service, parent, data, id);

            res.send(spirits);
        } catch (error) {
            console.log(error);
            fail(res, "Server error");
        }
    }

    /**
     * This API route requests a spirit of a kind from the database.
     * @param {Object} req
     * @param {Object} res
     * @returns {Object} The requested spirit.
     */
    load = async (req, res) => {
        try {
            let parent = null;
            let data = req.body.data ? req.body.data : {};
            let id = req.body.id ? req.body.id : null;

            // if the scope is local, the parent is the user's id
            if (req.body.scope === "local") {
                let user = await req.db.Spirit.recallOne("user",  null, { email: req.session.currentUser });
                if (user?.memory?._id) parent = user.memory._id;
                else {
                    fail(res, "User had no id on load()");
                    return;
                }
            } 

            // recall all spirits with the given service name and parent
            let spirit = await req.db.Spirit.recallOne(req.body.service, parent, data, id);

            res.send(spirit);
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
                let user = await req.db.Spirit.recallOne("user",  null, { email: req.session.currentUser });

                script = await import(scriptPath);
                result = await script.default(req, user, this.io);
                success(res, "Served.", result);
            }
            else fail(res, `Script not found: ${req.body.script} at ${scriptPath}`);
        } catch (error) {
            console.log(error);
            fail(res, "Server error");
        }
    }
}