require("dotenv").config();

let db = require("./models");

module.exports = {
    explore: function explore(path) {
        return `./${path}/${path}.js`;
    },
    data: db,
    chat: null,
    start: function start(world, pagesPath) {
        let theFront = require("./controllers/the-front");
        let explorer = require("./controllers/explorer");

        explorer.complete(world.explorer);
        theFront.complete(world.theFront);

        let pagesRouter = require("./controllers/pages")(pagesPath);

        require("./server")(theFront.router, explorer.router, pagesRouter, db.connectionSuccess);
    }
}