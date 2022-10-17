require("dotenv").config();

class NotherBaseFS {
    constructor() {
        this.express = require("express");
        this.session = require('express-session');
        this.methodOverride = require('method-override');
        this.MongoStore = require('connect-mongo');
        this.favicon = require('serve-favicon');
        this.http = require('http');
        this.app = this.express();
        this.server = this.http.createServer(this.app);
        this.io = new (require("socket.io").Server)(this.server);
        this.db = require("./models");
        this.started = false;
    }

    async start(worldPath, voidPath, frontPath, pagesPath) {
        if (!this.started) {
            //set views path
            this.app.set("view engine", "ejs");
            this.app.set("views", `${__dirname}/views`); 
        
            // allows us to delete
            this.app.use(this.methodOverride('_method'));

            // allows us to use post body data
            this.app.use(this.express.urlencoded({ extended: true }));
        
            // allows us to get static files like css
            this.app.use(this.express.static('public'));
            this.app.use(this.express.static(`${__dirname}/public`));
        
            // sets the favicon image
            this.app.use(this.favicon(__dirname + '/public/img/logo.png'));
        
            // Import my Controller
            const controllers = require("./controllers");
        
            //enable cookies
            if (this.db.connectionSuccess) {
                this.app.use(this.session({
                    store: this.MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
                    secret: process.env.SECRET || "won",
                    resave: false,
                    saveUninitialized: false
                }));

                console.log("sessions enabled");
            }
            else console.log("sessions disabled");
        
            this.io.on('connection', (socket) => {
                socket.join(socket.handshake.query.room);

                console.log(socket.rooms);

                socket.to(socket.handshake.query.room).emit(`${socket.handshake.query.name} has joined the room`);
        
                socket.on('disconnect', () => {});
            });
        
            this.app.use("/user", controllers.user);
        
            this.app.use("/chat", controllers.chat(this.io));
        
            this.app.use("/contact", controllers.contact);

            this.app.use("/game", controllers.game);
        
            this.app.use("/inventory", controllers.authCheck, controllers.inventory);
        
            this.app.use("/item", controllers.item);
        
            this.app.use("/the-front", await controllers.front(frontPath));

            this.app.use("/", controllers.pages(pagesPath));

            this.app.use("/", controllers.authCheck, await controllers.explorer(worldPath, voidPath));
        
            this.server.listen(process.env.PORT, function () {
                console.log(`Server started at ${process.env.PORT}`);
                this.started = true;
            });

        }
        else console.log("Server already started!");
    }
}

module.exports = new NotherBaseFS();