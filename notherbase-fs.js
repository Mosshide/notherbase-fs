import dotenv from "dotenv";
dotenv.config();
import Models from "./models/index.js";
import { Server } from "socket.io";
import express from "express";
import http from 'http';
import { fileURLToPath } from 'node:url';
const __dirname = fileURLToPath(new URL('./', import.meta.url));
import Creation from "./controllers/creation.js";
import SpiritWorld from "./controllers/spirit-world.js";
import favicon from 'serve-favicon';
import session from 'express-session';
import MongoStore from 'connect-mongo';


/**
 * The engine that runs a nother base.
 */
class NotherBaseFS {
    constructor(globals = {}, bases = {}) {
        this.bases = bases;
        let baseKeys = Object.keys(this.bases);
        for (let i = 0; i < baseKeys.length; i++) {
            this.bases[baseKeys[i]].static = express.static(this.bases[baseKeys[i]].directory + "/public");
            this.bases[baseKeys[i]].favicon = favicon(this.bases[baseKeys[i]].directory + this.bases[baseKeys[i]].icon);
            this.bases[baseKeys[i]].session = session({
                store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
                secret: process.env.SECRET,
                name: baseKeys[i] + '-session-id',
                resave: false,
                saveUninitialized: false,
                cookie: { 
                    secure: process.env.PRODUCTION == "true",
                    maxAge: 1000 * 60 * 60 * 24 * 28 // 28 days 
                } 
            });
        }

        this.app = express();
        this.server = http.createServer(this.app);
        this.io = new Server(this.server);
        this.spiritWorld = new SpiritWorld(this.io);
        this.creation = new Creation(bases);
        
        //set views path
        this.app.set("view engine", "ejs");
        this.app.set("views", `${__dirname}/views`); 
    
        // allows us to use post body data
        this.app.use(express.json({
            extended: true,
            inflate: true,
            type: 'application/x-www-form-urlencoded'
        }));

        //provide database access and etc to use in routes
        this.app.use((req, res, next) => {
            let split = req.hostname.split(".");
            if (split.length > 2) {
                if (split[split.length - 2].length < 3) req.hosting = split[split.length - 3] + split[split.length - 2];
                else req.hosting = split[split.length - 2];
            }
            else req.hosting = split[0];         
            console.log(req.hosting);
            console.log(req.session);
            
            
            req.contentPath = this.bases[req.hosting].directory;
            next();
        });

        this.app.use((req, res, next) => {
            this.bases[req.hosting].favicon(req, res, next);
        });

        //enable cookies
        this.app.use((req, res, next) => {
            this.bases[req.hosting].session(req, res, next);
        });       

        // allows us to get static files like css
        this.app.use(express.static(`${__dirname}/public`));
        this.app.use((req, res, next) => {
            this.bases[req.hosting].static(req, res, next);
        });
    
        //be safe
        if (process.env.PRODUCTION == "true") this.app.set('trust proxy', 1);

        //provide database access and etc to use in routes
        this.app.use((req, res, next) => {
            req.globals = globals;
            req.db = Models;
            req.lock = false;
            next();
        });

        //spirit world routes
        this.app.use("/s", this.spiritWorld.router);
        
        //all actual pages
        this.app.use("/", this.creation.router);
    
        //start the server
        this.server.listen(process.env.PORT, function () {
            console.log(`Server started at ${process.env.PORT}`);
            this.started = true;
        });
    }
}

export default NotherBaseFS;