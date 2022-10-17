const mongoose = require("mongoose");

const page = new mongoose.Schema({
	name: String,
	type: String,
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "users",
        required: false
    },
    data: {}
});

module.exports = mongoose.model('pages', page);