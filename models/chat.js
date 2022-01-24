const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    name: String,
	text: String,
    date: Number
});

module.exports = mongoose.model('chat', chatSchema);