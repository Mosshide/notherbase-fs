import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import Spirit from "./spirit.js";
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



export default {
    SendMail: SendMail,
    Spirit: Spirit,
    User: class User extends Spirit {
        constructor(service, email = null) {
            super({});
            this.body.route = "/user";
            this.body.service = service;
            this.email = email;
        }

        recall = async () => {
            let result = await this.recallFromData("email", this.email);
            return result;
        }
    },
    Item: class Item extends Spirit {
        constructor(service) {
            super({});
            this.body.route = "/item";
            this.body.service = service;
        }

        // name: String,
        // shortDescription: String,
        // fullDescription: String,
        // icon: String,
        // tags: [ String ],
        // image: String
    }
}