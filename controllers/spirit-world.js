import express from "express";
import { stripHtml } from "string-strip-html";
import { success, fail } from "./spirits/util.js";
import User from "./spirits/user.js";
import fs from 'fs';

export default class SpiritWorld {
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

        console.log(this.rooms[socket.handshake.query.room]);
    
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

    constructor(io) {
        this.io = io;
        this.rooms = {};

        this.router = express.Router();
        this.user = new User();

        this.router.post("/load", this.load);
        this.router.post("/serve", this.serve);
        this.router.use("/user", this.user.router);

        this.io.on('connection', this.#setupChat);
    }

    load = async (req, res) => {
        try {
            let parent = null;

            if (req.body.scope === "local") {
                let user = await req.db.User.recallOne(req.session.currentUser);
                if (user?.id) parent = user.id;
                else console.log("User had no id on load(): ", user);
            } 

            let spirit = await req.db.Spirit.recallOne(req.body.service, parent);

            if (!spirit.memory.data) spirit.memory.data = {};

            res.send(spirit.memory.data);
        } catch (error) {
            console.log(error);
            fail(res, "Server error");
        }
    }

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