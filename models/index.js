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
            super();
            this.body.route = "/";
            this.body.service = service;
            this.email = email;
        }

        recall = async () => {
            let result = await this.recallFromData("email", this.email);
            return result;
        }
    },
    Item: class Item extends Spirit {
        constructor(name = "") {
            super();
            this.body.route = "/";
            this.body.service = "item";

            this.memory = {
                data: {
                    name: name
                }
            }
        }

        recall = async () => {
            let result = await this.recallFromData("name", this.memory.data.name);
            return result;
        }
        
        commit = async (data = this.memory.data) => {
            let result = await this.commitByData("name", this.memory.data.name, data);
            return result;
        }

        delete = async () => {
            let result = await this.deleteByData("name", this.memory.data.name);
            return result;
        }
    }
}