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

/**
 * The engine that runs a nother base.
 */
class NotherBaseFS {
    constructor(globals = {}, bases = []) {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = new Server(this.server);
        this.spiritWorld = new SpiritWorld(this.io, bases);
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
    
        // allows us to get static files like css
        this.app.use(express.static('public'));
    
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