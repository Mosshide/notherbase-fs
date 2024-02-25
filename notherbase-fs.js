import dotenv from "dotenv";
dotenv.config();
import Models from "./models/index.js";
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
import SpiritWorld from "./controllers/spirit-world.js";

/**
 * The engine that runs a nother base.
 */
class NotherBaseFS {
    constructor(contentPath, globals = null, settings = {}) {
        this.settings = {
            siteTitle: "NotherBase",
            favicon: null,
            ...settings
        }
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = new Server(this.server);
        this.creation = new Creation(this.settings.siteTitle);
        this.spiritWorld = new SpiritWorld(this.io);
        
        //set views path
        this.app.set("view engine", "ejs");
        this.app.set("views", `${__dirname}/views`); 
    
        // allows us to delete
        this.app.use(methodOverride('_method'));
    
        // allows us to use post body data
        this.app.use(express.json({
            extended: true,
            inflate: true,
            type: 'application/x-www-form-urlencoded'
          }));
        //this.app.use(express.urlencoded({ extended: true }));
    
        // allows us to get static files like css
        this.app.use(express.static('public'));
        this.app.use(express.static(`${__dirname}/public`));
    
        // sets the favicon image
        if (this.settings.favicon) this.app.use(favicon(this.settings.favicon));
        else this.app.use(favicon(__dirname + '/public/img/logo.png'));
    
        //enable cookies
        this.app.use(session({
            store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
            secret: process.env.SECRET,
            resave: false,
            saveUninitialized: false
        }));

        //provide database access and etc to use in routes
        this.app.use((req, res, next) => {
            req.globals = globals;
            req.db = Models;
            req.contentPath = contentPath;
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