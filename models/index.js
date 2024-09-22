import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import Spirit from "./spirit.js";
import SendMail from "./send-mail.js";

mongoose.set('strictQuery', true);

mongoose.connection.on('connected', (err) => {
    console.log(`Mongoose connected to db`);
});

mongoose.connection.on('error', (err) => {
    console.log(`Mongoose ${err}`);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});

try {
    mongoose.connect(process.env.MONGODB_URI);
}
catch (err) {
    console.log(`Mongoose on connect: ${err}`);
}

export default {
    SendMail: SendMail,
    Spirit: Spirit
}