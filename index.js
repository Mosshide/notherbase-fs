require("dotenv").config();

module.exports = {
    explore: function explore(path) {
        return `./${path}/${path}.js`;
    },
    data: require("./models"),
    chat: null,
    start: function start(world) {
        let theFront = require("./controllers/the-front");
        let explorer = require("./controllers/explorer");

        explorer.complete(world.explorer);
        theFront.complete(world.theFront);

        require("./server")(theFront.router, explorer.router);
    }
}