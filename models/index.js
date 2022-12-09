import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

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
    mongoose.connect(process.env.MONGODB_URI, { 
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
}
catch (err) {
    console.log(`Mongoose on connect: ${err}`);
}


export {default as chat} from "./chat.js";
export {default as item} from "./item.js";
export {default as user} from "./user.js";
export {default as contact} from "./contact.js";
export {default as inventory} from "./inventory.js";
export {default as game} from "./game.js";
export {default as sendMail} from "./send-mail.js";
export {default as detail} from "./detail.js";
export {default as page} from "./page.js";