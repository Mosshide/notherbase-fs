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
import Creation from "./controllers/creation.js";
import Spirits from "./controllers/spirits.js";

class NotherBaseFS {
    constructor(contentPath) {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = new Server(this.server);
        this.db = db;
        this.creation = new Creation();
        this.spirits = new Spirits(this.io);
        
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
        this.app.use(session({
            store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
            secret: process.env.SECRET,
            resave: false,
            saveUninitialized: false
        }));

        this.app.use((req, res, next) => {
            req.db = this.db;
            req.contentPath = contentPath;

            next();
        });

        this.app.use("/s", this.spirits.router);
        
        this.app.use("/", this.creation.router);
    
        this.server.listen(process.env.PORT, function () {
            console.log(`Server started at ${process.env.PORT}`);
            this.started = true;
        });
    }
}

export default NotherBaseFS;