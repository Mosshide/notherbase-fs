import express from "express";
import fs from 'fs';
import { stripHtml } from "string-strip-html";
import contact from "./spirits/contact.js";
import inventory from "./spirits/inventory.js";
import item from "./spirits/item.js";
import memory from "./spirits/memory.js";
import serve from "./spirits/serve.js";
import user from "./spirits/user.js";

export default class Spirits {
    constructor(io) {
        this.io = io;
        this.router = express.Router();

        this.router.post(`/`, this.do);

        this.io.on('connection', this.setupChat);

        Object.assign(this, contact);
        Object.assign(this, inventory);
        Object.assign(this, item);
        Object.assign(this, memory);
        Object.assign(this, serve);
        Object.assign(this, user);
    }

    do = async (req, res) => {
        let result = null;
        
        try {
            result = await this[req.body.action](req);
        } catch (error) {
            console.log(err);
            res.status(500).end();
        }

        /* return {
            status: "success",
            message: "Successful!",
            data: {}
        } */
        // update spirits for compatibility, proper return, req.body.data, etc.
        
        res.send(result);
    }

    setupChat = (socket) => {
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
}