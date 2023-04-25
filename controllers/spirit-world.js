import express from "express";
import { stripHtml } from "string-strip-html";
import User from "./spirits/user.js";
import Contact from "./spirits/contact.js";
import { success, fail } from "./spirits/util.js";
import fs from 'fs';

export default class SpiritWorld {
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

    constructor(io) {
        this.io = io;
        this.router = express.Router();
        this.user = new User();
        this.contact = new Contact();

        this.router.post("/serve", this.serve);
        this.router.get("/load", this.load);
        this.router.use("/user", this.user.router);
        this.router.use("/contact-nother", this.contact.router);

        this.io.on('connection', this.#setupChat);
    }

    load = async (req, res) => {
        let parent = null;

        if (req.query.scope === "local") {
            let user = await req.db.User.recallOne(req.session.currentUser);
            parent = user.id;
        } 

        let spirit = await req.db.Spirit.recallOne(req.query.service, parent);

        if (!spirit.memory.data) spirit.memory.data = {};

        res.send(spirit.memory.data);
    }

    serve = async (req, res) => {
        try {
            let scriptPath = `${req.contentPath}${req.body.data.route}/${req.body.data.script}.js`;
            
            let script, result = null;

            if (fs.existsSync(scriptPath)) {
                let user = await req.db.User.recallOne(req.session.currentUser);

                script = await import(scriptPath);
                result = await script.default(req, user);
                success(res, "Served.", result);
            }
            else fail(res, `Script not found: ${req.body.data.script} at ${scriptPath}`);
        } catch (error) {
            console.log(error);
            fail(res, "Server error");
        }
    }
}