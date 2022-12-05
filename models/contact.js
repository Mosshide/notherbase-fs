import mongoose from "mongoose";

// This shows the kind of documents we're interacting with in the db
const contact = mongoose.model('contacts', new mongoose.Schema({
	user: { 
		type: mongoose.Schema.Types.ObjectId, 
		ref: "users",
		required: true
	},
	location: String,
	content: String
}));

export default contact;