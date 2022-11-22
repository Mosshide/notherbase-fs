module.exports = {
    connectionSuccess: require("./start-mongoose"),
    chat: require("./chat"),
    item: require("./item"),
    user: require("./user"),
    contact: require("./contact"),
    inventory: require("./inventory"),
    game: require("./game"),
    sendMail: require("./send-mail"),
    detail: require("./detail"),
    page: require("./page")
}
