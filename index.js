module.exports = {
    explore: function explore(path) {
        return `./${path}/${path}.js`;
    },
    data: require("./models"),
    chat: null,
    start: function (world) {
        let theFront = require("the-front");
        let explorer = require("explorer");

        explorer.complete(world.explorer);
        theFront.complete(world.theFront);

        require("server")(theFront.router, explorer.router);
    }
}