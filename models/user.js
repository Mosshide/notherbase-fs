import mongoose from "mongoose";

//convert schema to model
const user = mongoose.model('users', new mongoose.Schema({
        username: String,
        password: String,
        email: String,
        coin: Number,
        home: String,
        authLevels: [ String ],
        location: String,
        attributes: {
            translation: Number,
            strength: Number,
            agility: Number,
            defense: Number
        },
        reset: {
            token: Number,
            exp: Number
        }
    })
);

export default user;