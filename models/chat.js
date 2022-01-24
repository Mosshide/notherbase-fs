const mongoose = require("mongoose");

//get schema template
const Schema = mongoose.Schema;
const chatSchema = new Schema({
    name: String,
	text: String,
    date: Number
});

module.exports = mongoose.model('chat', chatSchema);