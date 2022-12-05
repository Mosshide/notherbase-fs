import mongoose from "mongoose";

// This shows the kind of documents we're interacting with in the db
const inventory = mongoose.model('inventories', new mongoose.Schema({
	user: { 
		type: mongoose.Schema.Types.ObjectId, 
		ref: "users",
		required: true
	},
	items: [{
		item: { 
			type: mongoose.Schema.Types.ObjectId, 
			ref: "items"
		},
		amount: Number
	}]
}));

export default inventory;