import mongoose from "mongoose";

const detail = mongoose.model('details', new mongoose.Schema({
    _lastUpdate: Number,
    route: String,
	service: String,
	scope: String,
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "users",
        required: false
    },
    data: {}
}));

export default detail;