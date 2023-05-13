import Spirit from "./spirit.js";
import Item from "./item.js";
import bcrypt from "bcrypt";

export default class User extends Spirit {
    static recallOne = async (email = null, username = null, id = null) => {
        let spirit = new User(email, id);

        let query = null;

        if (email) {
            query = Spirit.buildQuery("user", { email: email });
        }
        else if (username) {
            query = Spirit.buildQuery("user", { username: username });
        }
        else if (id) {
            query = Spirit.buildQuery("user", null, null, id);
        }
        
        let found = null;

        if (query) found = await Spirit.db.findOne(query);

        if (found) {
            spirit.memory = found;
            spirit.id = found._id;
            
            return spirit;
        }
        else return null;
    }

    static create = async (username, password, email) => {
        let spirit = new User(email);

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        spirit.memory = await Spirit.db.create({
            route: "/",
            service: "user",
            scope: "global",
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

        return spirit;
    }

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

    offsetItem = async (name, offset) => {
        let item = await Item.recallOne(name);
    
        if (!item) return false;
    
        let inv = this.memory.data.inventory;

        for (let j = 0; j < inv.length; j++) {
            if (inv[j].name === name) {
                if (inv[j].amount >= -Math.floor(offset)) {
                    inv[j].amount += Math.floor(offset);
    
                    if (inv[j].amount === 0) {
                        let empty = inv[j];
    
                        inv.splice(j, 1);
                    }

                    this.memory._lastUpdate = Date.now();
                    await this.commit();
                    return true;
                }
                else return false;
            }
        }
        
        if (offset > 0) {
            inv.push({
                name: name,
                amount: offset
            });

            this.memory._lastUpdate = Date.now();

            await this.commit();

            return true;
        }
        else return false;
    }

    checkAttribute = async (check, against) => {
        let att = this.memory.data.attributes;
    
        return att[check] >= against;
    }

    setAttribute = async (change, to) => {
        let att = this.memory.data.attributes;
    
        att[change] = to;
        this.memory._lastUpdate = Date.now();
        await this.commit();
    
        return "Attributes set.";
    }

    incrementAttribute = async (change, max) => {
        let att = this.memory.data.attributes;
    
        if (att[change] < max) {
            att[change]++;
            this.memory._lastUpdate = Date.now();
            await this.commit();
        } 
        
        return att[change];
    }
}

