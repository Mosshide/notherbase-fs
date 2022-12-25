import Spirit from "./spirit.js";
import bcrypt from "bcrypt";

export default class User extends Spirit {
    static recallOne = async (target, id = null) => {
        if (target) {
            return await super.recallOne({
                route: "/",
                service: "user",
                scope: "global",
                parent: null
            }, { email: target });
        }
        else if (id) {
            return await super.recallOne({
                route: "/",
                service: "user",
                scope: "global",
                parent: null
            }, null, id);
        }
        else return null;
    }

    static logout = async (req) => {
        await req.session.destroy();

        return "Logged out.";
    }

    static sendPasswordReset = async (req) => {
        let spirit = await User.recallOne(req.body.data.email);

        if (spirit) {
            let token = Math.floor(Math.random() * 9999);

            spirit.memory.data.reset.token = token;
            spirit.memory.data.reset.exp = Date.now() + (1000 * 60 * 30);
    
            req.db.SendMail.passwordReset(req.body.data.email, token);
    
            return "Password reset.";
        }
        else return "User not found.";
    }

    static changePassword = async (req) => {
        let spirit = await super.recall({
            route: "/",
            service: "user",
            scope: "global",
            parent: null
        }, { 
            reset: {
                token: token
            } 
        }, null);

        this.check(spirit, "Reset token not valid!");
        this.check(spirit.memory.data.reset.exp < Date.now(), "Reset token expired!");
        this.check(req.body.data.password !== req.body.data.confirmation, "Passwords must match!");

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(req.body.data.password, salt);

        spirit.memory.data.password = hash;
        await spirit.commit();

        return "Password changed successfully!";
    }

    static register = async (req) => {
        this.check(req.body.data.password.length > 7, "Password too short.");
        this.check(req.body.data.email.length > 7, "Email too short.");
        this.check(req.body.data.username.length > 2, "Username too short.");

        let spirit = await User.recallOne(req.body.data.email);

        this.check(!spirit, "Email already in use!");

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(req.body.data.password, salt);

        spirit = await super.create({
            route: "/",
            service: "user",
            scope: "global",
            parent: null
        }, {
            username: req.body.data.username,
            password: hash,
            email: req.body.data.email,
            reset: {
                token: null,
                exp: null
            },
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
        });

        return "Registration successful!";
    }

    static login = async (req) => {
        let spirit = await User.recallOne(req.body.data.email);
        Spirit.check(spirit, "User not found.");

        console.log(spirit.memory.data, req.body.data);

        let passResult = await bcrypt.compare(req.body.data.password, spirit.memory.data.password);
        Spirit.check(passResult, "Password doesn't match the email.");

        req.session.currentUser = req.body.data.email;

        return "Logged in.";
    }

    static changeUserEmail = async (req) => {
        this.loginCheck(req);

        let spirit = await User.recallOne(req.body.data.email);

        this.check(!spirit, "Email already in use!");

        spirit = await this.findUser(req.session.currentUser);

        spirit.memory.data.email = req.body.data.email;
        await spirit.commit();

        req.session.currentUser = req.body.data.email;

        return "Email changed.";
    }

    static changeUsername = async (req) => {
        this.loginCheck(req);
       
        let spirit = await super.recall({
            route: "/",
            service: "user",
            scope: "global",
            parent: null
        }, { username: req.body.data.username });
        this.check(!spirit, "Username already in use!");

        spirit = await User.recallOne(req.session.currentUser);

        spirit.memory.data.username = req.body.data.username;
        await spirit.commit();

        return "Username changed";
    }

    static deleteUserPermanently = async (req) => {
        this.loginCheck(req);
        
        let deleted = await super.delete({
            route: "/",
            service: "user",
            scope: "global",
            parent: null
        }, { email: req.session.currentUser });

        this.check(deleted > 0, "No account deleted");

        await req.session.destroy();

        return "Account deleted.";
    }

    static getInventory = async (req) => {
        User.loginCheck(req);
        let spirit = await User.recallOne(req.session.currentUser);
        let inv = spirit.memory.data.inventory;
    
        this.check(inv, "User inventory not found.");
    
        return inv;
    }

    static updateItemInInventory = async (req) => {
        this.check(req.body.data.name && req.body.data.amount, `${req.body.data.name} ${req.body.data.amount} Check Input!`);
    
        let item = req.db.Item.recall(req.body.data.name);
    
        this.check(item, "Item not found in database.");
    
        let user = await User.recallOne(req.session.currentUser);
        let inv = user.memory.data.inventory;
    
        let holding = false;
    
        for (let j = 0; j < inv.length; j++) {
            if (inv[j].name === req.body.data.name) {
                holding = true;
    
                if (inv[j].amount >= -Math.floor(req.body.data.amount)) {
                    inv[j].amount += Math.floor(req.body.data.amount);
    
                    if (inv[j].amount === 0) {
                        let empty = inv[j];
    
                        inv.splice(j, 1);
                        await user.commit();
    
                        return "Item emptied.";
                    }
                    else {
                        await user.commit();
    
                        return inv[j];
                    }
                }
                else {
                    return `Unable to remove ${req.body.data.amount} ${req.body.data.name} 
                        from inventory because the inventory has only ${inv[j].amount}.`;
                }
            }
        }
        
        if (!holding) {
            if (req.body.data.amount > 0) {
                inv.push({
                    name: req.body.data.name,
                    amount: req.body.data.amount
                });
    
                await user.commit();
    
                return inv[inv.length - 1];
            }
            else {
                return `Unable to remove ${req.body.data.amount} ${req.body.data.name} 
                    from inventory because the inventory has none.`;
            }
        };
    }

    static getAttributes = async (req) => {
        this.loginCheck(req);
    
        let user = await User.recallOne(req.session.currentUser);
    
        return user.memory.data.attributes;
    }

    static checkAttribute = async (req) => {
        this.loginCheck(req);
    
        let user = await User.recallOne(req.session.currentUser);
        let att = user.memory.data.attributes;
    
        if (att[req.body.data.check] >= req.body.data.against) {
            return "pass";
        }
        else return "fail";
    }

    static setAttribute = async (req) => {
        this.loginCheck(req);
    
        let user = await User.recallOne(req.session.currentUser);
    
        user.memory.data.attributes[req.body.data.change] = req.body.data.to;
        await user.commit();
    
        return "Attributes set.";
    }

    static incrementAttribute = async (req) => {
        this.loginCheck(req);
    
        let user = await User.recallOne(req.session.currentUser);
        let att = user.memory.data.attributes;
    
        if (att[req.body.data.change] < req.body.data.max) {
            att[req.body.data.change]++;
            await user.commit();
    
            return att[req.body.data.change];
        } 
        else return att[req.body.data.change];
    }

    constructor(email, id = null) {
        super();
        this.email = email;
        this.id = id;
    }

    static loginCheck = (req) => {
        Spirit.check(req.session.currentUser, "Please login first.");
    }
}

