import dotenv from "dotenv";
dotenv.config();
import * as db from "./models/index.js";
import { Server } from "socket.io";
import express from "express";
import session from 'express-session';
import methodOverride from 'method-override';
import MongoStore from 'connect-mongo';
import favicon from 'serve-favicon';
import http from 'http';
import { fileURLToPath } from 'node:url';
const __dirname = fileURLToPath(new URL('./', import.meta.url));

import { stripHtml } from "string-strip-html";

import * as controllers from "./controllers/index.js";

class NotherBaseFS {
    constructor(worldPath, voidPath, frontPath, pagesPath) {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = new Server(this.server);
        this.db = db;
        
        //set views path
        this.app.set("view engine", "ejs");
        this.app.set("views", `${__dirname}/views`); 
    
        // allows us to delete
        this.app.use(methodOverride('_method'));
    
        // allows us to use post body data
        this.app.use(express.urlencoded({ extended: true }));
    
        // allows us to get static files like css
        this.app.use(express.static('public'));
        this.app.use(express.static(`${__dirname}/public`));
    
        // sets the favicon image
        this.app.use(favicon(__dirname + '/public/img/logo.png'));
    
        //enable cookies
        if (this.db.connectionSuccess) {
            this.app.use(session({
                store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
                secret: process.env.SECRET,
                resave: false,
                saveUninitialized: false
            }));
    
            console.log("sessions enabled");
        }
        else console.log("sessions disabled");
    
        this.io.on('connection', (socket) => {
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
        });

        this.app.use((req, res, next) => {
            req.db = this.db;
            req.worldDir = worldPath;
            req.frontDir = frontPath;
            req.pagesDir = pagesPath;
            req.voidDir = voidPath;

            next();
        });
        
        this.app.use("/user", controllers.user);
    
        this.app.use("/contact", controllers.contact);
    
        this.app.use("/game", controllers.game);
    
        this.app.use("/inventory", controllers.authCheck, controllers.inventory);
    
        this.app.use("/item", controllers.item);
    
        this.app.use("/the-front", controllers.front);
    
        this.app.use("/", controllers.authCheck, controllers.explorer);
        
        this.app.use("/", controllers.pages);

        this.app.use(controllers.void);
    
        this.server.listen(process.env.PORT, function () {
            console.log(`Server started at ${process.env.PORT}`);
            this.started = true;
        });
    }
}

export default NotherBaseFS;