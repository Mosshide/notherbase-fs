// This allows us to use Mongoose to connect to MongoDB
const mongoose = require("mongoose");

const poi = new mongoose.Schema({
    route: String,
	name: String,
	type: String,
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "users",
        required: false
    },
    data: {}
});

// This tells Mongoose to use the exampleSchema to access the examples collection
// in our db and then exports the model so we can use it.
module.exports = mongoose.model('pois', poi);