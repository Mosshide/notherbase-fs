import dotenv from "dotenv";
dotenv.config();
import Spirit from "./server/spirit.js";
import SendMail from "./server/send-mail.js";
import { Server } from "socket.io";
import express from "express";
import http from 'http';
import { fileURLToPath } from 'node:url';
const __dirname = fileURLToPath(new URL('./', import.meta.url));
import Creation from "./server/creation.js";
import SpiritWorld from "./server/spirit-world.js";
import favicon from 'serve-favicon';
import session from 'express-session';
import MongoStore from 'connect-mongo';


/**
 * The engine that runs nother bases.
 */
class NotherBaseFS {
    constructor(globals = {}, bases = {}) {
        this.bases = bases;
    
        this.initServer();
    }

    initServer() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = new Server(this.server);
        this.spiritWorld = new SpiritWorld(this.io);
        this.creation = new Creation(this.bases);

        //set view engine
        this.app.set("view engine", "ejs");
        
        //set views path
        this.app.set("views", `${__dirname}/views`); 
    
        // allows us to use post body data
        this.app.use(express.json({
            extended: true,
            inflate: true,
            type: 'application/x-www-form-urlencoded',
            limit: '50mb'
        }));

        //be safe, needs to be before session
        if (process.env.PRODUCTION == "true") this.app.set('trust proxy', 2);

        //provide multiple base support
        let store = MongoStore.create({ mongoUrl: process.env.MONGODB_URI });
        let baseKeys = Object.keys(this.bases);
        for (let i = 0; i < baseKeys.length; i++) {
            this.bases[baseKeys[i]].static = express.static(this.bases[baseKeys[i]].directory + "/public");
            if (this.bases[baseKeys[i]].icon) this.bases[baseKeys[i]].favicon = favicon(this.bases[baseKeys[i]].directory + this.bases[baseKeys[i]].icon);
            this.bases[baseKeys[i]].session = session({
                store: store,
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

        
        this.app.use((req, res, next) => {
            let split = req.hostname.split(".");
            if (split.length > 2) {
                if (split[split.length - 2].length < 3) req.hosting = split[split.length - 3] + split[split.length - 2];
                else req.hosting = split[split.length - 2];
            }
            else req.hosting = split[0]; 
            
            req.contentPath = this.bases[req.hosting].directory;
            next();
        });

        // allows us to get static files like css
        this.app.use((req, res, next) => {
            this.bases[req.hosting].static(req, res, next);
        });
        this.app.use(express.static(`${__dirname}/public`));

        this.app.use((req, res, next) => {
            if (this.bases[req.hosting].favicon) this.bases[req.hosting].favicon(req, res, next);
            else next();
        });

        //enable cookies
        this.app.use((req, res, next) => {
            this.bases[req.hosting].session(req, res, next);
        });  

        //provide database access and etc to use in routes
        this.app.use(async (req, res, next) => {
            req.Spirit = Spirit;
            req.SendMail = SendMail;
            req.user = req.session?.currentUser ? await req.Spirit.findOne({ service: "user", username: req.session.currentUser }) : null;
            req.lock = false;
            // enables sessions only if the protocol is https and we are in production, or if we are in development
            req.sessionsEnabled = (process.env.PRODUCTION == "true" && req.secure) || process.env.PRODUCTION == "false";
            next();
        });

        //destroy session if it is not authorized
        // this.app.use(async (req, res, next) => {
        //     if (req.session.currentUser) {
        //         if (req.user?.memory?.data?.sessions?.[req.session.id]) {
        //             if (req.user.memory.data.sessions[req.session.id] < Date.now()) {
        //                 req.session.regenerate(() => {});
        //                 delete req.user.memory.data.sessions[req.session.id];
        //                 await req.user.commit();
        //             }
        //         }
        //         else req.session.regenerate(() => {});
        //     }

        //     next();
        // });

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