import mongoose from "mongoose";

const game = mongoose.model('games', new mongoose.Schema({
	name: String,
	data: {}
}));

export default game;