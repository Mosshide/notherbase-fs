require("dotenv").config();
const mongoose = require("mongoose");

let success = null;

//handlers
mongoose.connection.on('connected', (err) => {
	console.log(`Mongoose connected to db`);
	success = true;
});

mongoose.connection.on('error', (err) => {
	console.log(`Mongoose ${err}`);
	success = false;
});

mongoose.connection.on('disconnected', () => {
	console.log('Mongoose disconnected');
	success = false;
});

try {
	mongoose.connect(process.env.MONGODB_URI, { 
		useNewUrlParser: true,
		useUnifiedTopology: true
	});

	success = true;
}
catch (err) {
	console.log(`Mongoose on connect: ${err}`);

	success = false;
}

module.exports = success;