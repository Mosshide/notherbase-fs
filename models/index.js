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

let migrate = function () {
    // migrate
    // const user = mongoose.model('users', new mongoose.Schema({
    //     username: String,
    //     password: String,
    //     email: String,
    //     coin: Number,
    //     home: String,
    //     authLevels: [ String ],
    //     location: String,
    //     attributes: {
    //         translation: Number,
    //         strength: Number,
    //         agility: Number,
    //         defense: Number
    //     },
    //     reset: {
    //         token: Number,
    //         exp: Number
    //     }
    // }));
    // const page = mongoose.model('pages', new mongoose.Schema({
    // 	name: String,
    // 	type: String,
    //     user: { 
    //         type: mongoose.Schema.Types.ObjectId, 
    //         ref: "users",
    //         required: false
    //     },
    //     data: {}
    // }));
    
    // user.find({}, async (err, users) => {
    //     for (let i = 0; i < users.length; i++) {
    //         let userSpirit = new User("user", users[i].email);
            
    //         await userSpirit.create({
    //             username: users[i].username,
    //             password: users[i].password,
    //             email: users[i].email,
    //             coin: users[i].coin,
    //             home: users[i].home,
    //             authLevels: users[i].authLevels,
    //             location: users[i].location,
    //             attributes: users[i].attributes,
    //             inventory: []
    //         });
            
    //         let foundPages = await page.find({ user: users[i]._id });
    
    //         for (let i = 0; i < foundPages.length; i++) {
    //             let spirit = new Spirit({
    //                 route: `/${foundPages[i].name}`,
    //                 service: foundPages[i].name,
    //                 scope: foundPages[i].type,
    //                 parent: userSpirit.memory._id,
    //                 _lastUpdate: 0,
    //                 data: foundPages[i].data.tickets
    //             });
        
    //             let found = await spirit.recall();
        
    //             if (found) {
    //                 spirit.memory.data.tickets.concat(foundPages[i].data.tickets);
    //                 await spirit.commit();
    //             }
    //             else await spirit.create({
    //                 tickets: foundPages[i].data.tickets 
    //             });
    //         }
    //     }
    // });
}

export default {
    SendMail: SendMail,
    Spirit: Spirit,
    User: User,
    Item: Item
}