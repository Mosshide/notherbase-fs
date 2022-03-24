require("dotenv").config();
const mongoose = require("mongoose");

let success = false;

//connect mongoose and mongo
let init = async function init() {
	try {
		await mongoose.connect(process.env.MONGODB_URI, { 
			useNewUrlParser: true,
			useUnifiedTopology: true
		});
	
		success = true;

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
	}
	catch (err) {
		console.log(`Mongoose on connect: ${err}`);
		success = false;
	}
}

init();

module.exports = success;