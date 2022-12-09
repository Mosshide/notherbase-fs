import mongoose from "mongoose";

const page = mongoose.model('pages', new mongoose.Schema({
	name: String,
	type: String,
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "users",
        required: false
    },
    data: {}
}));

export default page;