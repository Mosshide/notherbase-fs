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
        this.io.on('connection', this.setupChat);

        this.user = new User();
        this.router = express.Router();
        this.router.post("/load", this.load);
        this.router.post("/serve", this.serve);
        this.router.use("/user", this.user.router);
    }

    /**
     * Sets up socket.io for instant messaging and etc.
     * @param {*} socket 
     */
    setupChat = (socket) => {
        try {
            let roomName = socket.handshake.query.room;
            socket.join(roomName);
            let room = this.rooms[roomName];
            if (room) room.users.push(socket.handshake.query.name);
            else {
                this.rooms[roomName] = {
                    users: [ socket.handshake.query.name ]
                }
                room = this.rooms[roomName];
            }
        
            this.io.to(roomName).emit("chat message", {
                name: "Server",
                time: Date.now(),
                text: `${socket.handshake.query.name} has joined the room.`
            });

            this.io.to(roomName).emit("chat info", {
                name: socket.handshake.query.room,
                time: Date.now(),
                data: {
                    users: room.users
                }
            });
        
            socket.on("chat message", (msg) => {
                this.io.to(roomName).emit("chat message", {
                    name: msg.name,
                    time: msg.time,
                    text: stripHtml(msg.text).result
                });
            });
        
            socket.on('disconnect', () => {
                room.users.splice(room.users.indexOf(socket.handshake.query.name));

                this.io.to(roomName).emit("chat message", {
                    name: "Server",
                    time: Date.now(),
                    text: `${socket.handshake.query.name} has left the room.`
                });

                this.io.to(roomName).emit("chat info", {
                    name: socket.handshake.query.room,
                    time: Date.now(),
                    data: {
                        users: room.users
                    }
                });

                if (room.users.length < 1) delete this.rooms[roomName];
            });
        } catch (error) {
            console.log(error);
            fail(res, "Server error: Sockets");
        }        
    }

    /**
     * This API route requests all spirits of a kind from the database.
     * @param {Object} req
     * @param {Object} res
     * @returns {Object} The requested spirits.
     */
    load = async (req, res) => {
        try {
            let query = {
                service: req.body.service,
                parent: null
            };
            if (req.body.data) query.data = req.body.data;
            if (req.body.id) query._id = req.body.id;

            // if the scope is local, the parent is the user's id
            if (req.body.scope === "local") {
                if (req.user?._id) query.parent = req.user._id;
                else {
                    fail(res, "User had no id on load()");
                    return;
                }
            } 

            // recall all spirits with the given service name and parent
            let spirits = await req.Spirit.find(query);

            res.send(spirits);
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
                script = await import(process.env.WINDOWS == "true" ? `file://${scriptPath}` : scriptPath);
                result = await script.default(req, req.user, this.io);
                success(res, "Served.", result);
            }
            else fail(res, `Script not found: ${req.body.script} at ${scriptPath}`);
        } catch (error) {
            console.log(error);
            fail(res, "Server error");
        }        
    }
}