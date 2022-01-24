let started = false;
let theFront, explorer = null;

function start() {
    if (!started) {
        require("dotenv").config();
    
        // Setup for Express
        const express = require("express");
        const app = express();
        app.set("view engine", "ejs");
    
        //setup for sockets
        const http = require('http');
        const server = http.createServer(app);
        const { Server } = require("socket.io");
        const io = new Server(server);
    
        // allows us to delete
        const methodOverride = require('method-override');
        app.use(methodOverride('_method'));
    
        //auth
        const session = require('express-session');
        const MongoStore = require('connect-mongo');
    
        // allows us to use post body data
        app.use(express.urlencoded({ extended: true }));
    
        // allows us to get static files like css
        app.use(express.static('public'));
    
        // sets the favicon image
        const favicon = require('serve-favicon');
        app.use(favicon(__dirname + '/public/img/logo.png'));
    
        // Import my Controller
        const controllers = require("./controllers");
    
        //enable cookies
        app.use(session({
            store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
            secret: process.env.SECRET || "won",
            resave: false,
            saveUninitialized: false
        }));
    
        io.on('connection', (socket) => {
            socket.join(socket.handshake.query.room);
    
            socket.on('disconnect', () => {});
        });
    
        app.use("/user", controllers.user);
    
        app.use("/portfolio", controllers.portfolio);
    
        app.use("/chat", controllers.chat(io));
    
        app.use("/contact", controllers.contact);
    
        app.use("/inventory", controllers.inventory);
    
        app.use("/item", controllers.item);
    
        app.use("/the-front", theFront);
    
        app.use("/", controllers.authCheck, explorer);
    
        // Go Off (On)
        server.listen(process.env.PORT);
    
        started = true;
    }
    else console.log("Server already started!");
}

module.exports = function set(frontRouter, exploreRouter) {
    theFront = frontRouter;
    explorer = exploreRouter;

    return start;
}