import mongoose from "mongoose";

const item = mongoose.model('items', new mongoose.Schema({
	name: String,
	shortDescription: String,
	fullDescription: String,
	icon: String,
	tags: [ String ],
	image: String
}));

export default item;