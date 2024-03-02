import Spirit from "./spirit.js";
import Item from "./item.js";
import bcrypt from "bcrypt";

/**
 * A user spirit.
 * @extends Spirit
 */
export default class User extends Spirit {
    /**
     * Recalls one user from the database.
     * @param {String} email Email address of the user.
     * @param {String} username The user's name.
     * @param {ObjectID} id The MongoDB id of the user.
     * @returns A user found or null.
     */
    static recallOne = async (email = null, username = null, id = null) => {
        let user = new User(email, id);

        let query = null;

        if (id) {
            query = Spirit.buildQuery("user", null, null, id);
        }
        else if (username) {
            query = Spirit.buildQuery("user", { username: username });
        }
        else if (email) {
            query = Spirit.buildQuery("user", { email: email });
        }
        else return null;
        
        let found = await Spirit.db.findOne(query);

        if (found) {
            user.memory = found;
            user.id = found._id;
            user.email = found.data.email;
            
            return user;
        }
        else return null;
    }

    /**
     * Creates one user in the database.
     * @param {String} email Email address of the user.
     * @param {String} password The user's ****.
     * @param {String} username The user's name.
     * @returns The user created.
     */
    static create = async (username, password, email) => {
        let user = new User(email);

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        user.memory = await Spirit.db.create({
            service: "user",
            parent: null,
            _lastUpdate: Date.now(),
            data: {
                username: username,
                password: hash,
                email: email,
                resetToken: null,
                resetExp: null,
                coin: 0,
                home: "/",
                authLevels: [ "Basic" ],
                location: "/the-front",
                attributes: {
                    translation: 0,
                    strength: 0,
                    agility: 0,
                    defense: 0
                },
                inventory: []
            }
        });

        return user;
    }

    /**
     * Delete a user account.
     * @param {String} email Email address of the account to delete.
     * @returns 
     */
    static delete = async (email) => {
        let found = await Spirit.db.findAndDelete(Spirit.buildQuery({
            service: "user",
            parent: null
        }, { email: email }));

        return found.deletedCount;
    }

    constructor(email, id = null) {
        super();
        this.email = email;
        this.id = id;
    }
}

