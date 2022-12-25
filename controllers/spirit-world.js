import express from "express";
import { stripHtml } from "string-strip-html";

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

        this.router.post(`/serve`, this.serve);
        this.router.post("/load", this.load);
        this.router.post(`/user/:action`, this.user);
        this.router.post(`/contact-nother`, this.contactNother);

        this.io.on('connection', this.#setupChat);
    }

    load = async (req, res) => {
        let user = await req.db.User.recall(req.session.currentUser);

        let spirit = await req.db.Spirit.recall({
            route: "/",
            service: "user",
            scope: "global",
            parent: user.memory
        });

        await contact.commit({
            user: req.session.currentUser,
            location: req.body.data.route,
            content: req.body.data.content
        });

        return success();
    }

    user = async (req, res) => {
        try {
            let result;
        
            if (req.db.User[req.params.action]) result = {
                status: "success",
                message: "User script ran.",
                data: await req.db.User[req.params.action](req)
            }
            else result = {
                status: "failed",
                message: `No function with the name ${req.body.action}`,
                data: {}
            }
            
            res.send(result);
        } catch (error) {
            console.log(error);
            res.send(error);
        }
    }

    serve = async (req) => {
        if (!req.body.route) req.body.route = req.path;
        
        let scriptPath = `${req.contentPath}${req.body.route}/${req.body.data.script}.js`;
        
        let script, result = null;

        if (fs.existsSync(scriptPath)) {
            let user = await findUser(req);

            script = await import(scriptPath);
            result = await script.default(req, user);
            return success("Served.", result);
        }
        else return fail(`Script not found: ${req.body.data.script} at ${scriptPath}`);
    }

    contactNother = async function(req) {
        req.body.service = "contact";
        let contact = new req.db.Spirit(req.body);

        await contact.commit({
            user: req.session.currentUser,
            location: req.body.data.route,
            content: req.body.data.content
        });

        return success();
    }
}