import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import Spirit from "./spirit.js";
import Item from "./item.js";
import User from "./user.js";
import SendMail from "./send-mail.js";

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

// let migrate = function () {
//     // migrate

//     const user = mongoose.model('users', new mongoose.Schema({
//         username: String,
//         password: String,
//         email: String,
//         coin: Number,
//         home: String,
//         authLevels: [ String ],
//         location: String,
//         attributes: {
//             translation: Number,
//             strength: Number,
//             agility: Number,
//             defense: Number
//         },
//         reset: {
//             token: Number,
//             exp: Number
//         }
//     }));
//     const page = mongoose.model('pages', new mongoose.Schema({
//     	name: String,
//     	type: String,
//         user: { 
//             type: mongoose.Schema.Types.ObjectId, 
//             ref: "users",
//             required: false
//         },
//         data: {}
//     }));
    
//     user.find({}, async (err, users) => {
//         for (let i = 0; i < users.length; i++) {
//             let userSpirit = await User.create(
//                 users[i].username,
//                 users[i].password,
//                 users[i].email
//             );
            
//             let foundPages = await page.find({ user: users[i]._id });
    
//             for (let i = 0; i < foundPages.length; i++) {
//                 let spirit = await Spirit.create({
//                     route: `/${foundPages[i].name}`,
//                     service: foundPages[i].name,
//                     scope: foundPages[i].type,
//                     parent: userSpirit.memory._id,
//                     _lastUpdate: 0
//                 }, foundPages[i].data.tickets);
//             }
//         }
//     });
// }

// migrate();

export default {
    SendMail: SendMail,
    Spirit: Spirit,
    User: User,
    Item: Item
}