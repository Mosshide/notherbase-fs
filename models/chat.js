import mongoose from "mongoose";

const chat = mongoose.model('chats', new mongoose.Schema({
    name: String,
	text: String,
    date: Number
}));

export default chat;