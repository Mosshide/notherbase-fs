import bcrypt from "bcrypt";

export default class User extends Spirit {
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

    loginCheck = (req) => {
        check(req.session.currentUser, "Please login first.");
    }

    findUser = async (req, email = req.session.currentUser) => {
        let user = new req.db.User("user", email);
        let userData = await user.recall();

        check(userData, "User not found.");

        return user;
    }

    logout = async (req) => {
        loginCheck(req);

        await req.session.destroy();

        return success("Logged out.");
    }

    sendPasswordReset = async (req) => {
        let reset = new req.db.User("reset");

        let token = Math.floor(Math.random() * 9999);

        await reset.create({
            email: req.body.data.email, 
            token: token, 
            tokenExp: Date.now() + (1000 * 60 * 30)
        });

        req.db.SendMail.passwordReset(req.body.data.email, token);

        return success("Password reset.", {});
    }

    changePassword = async (req) => {
        let reset = new req.db.User("reset");
        let resetData = await reset.recallFromData("token", req.body.data.token);

        check(resetData, "Reset token not valid!");
        check(resetData.tokenExp < Date.now(), "Reset token expired!");
        check(req.body.data.password !== req.body.data.confirmation, "Passwords must match!");

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(req.body.data.password, salt);

        let user = new req.db.User("user");
        let userData = (await user.recallFromData("email", resetData.email)).data;

        userData.password = hash;
        await user.commit(userData);

        await reset.delete();

        return success("Password changed successfully!");
    }

    register = async (req) => {
        check(req.body.data.password.length > 7, "Password too short.");
        check(req.body.data.email.length > 7, "Email too short.");
        check(req.body.data.username.length > 2, "Username too short.");

        let user = new req.db.User("user", req.body.data.email);
        let userData = await user.recall();

        check(!userData, "Email already in use!");

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(req.body.data.password, salt);

        await user.create({
            username: req.body.data.username,
            password: hash,
            email: req.body.data.email,
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

        return success("Registration successful!");
    }

    login = async (req) => {
        let user = await findUser(req, req.body.data.email);

        let passResult = await bcrypt.compare(req.body.data.password, user.memory.data.password);
        check(passResult, "Password doesn't match.");

        req.session.currentUser = req.body.data.email;

        return success("Logged in.");
    }

    changeUserEmail = async (req) => {
        loginCheck(req);

        let user = new req.db.User("user", req.body.data.email);
        let userData = await user.recall();

        check(!userData, "Email already in use!");

        user = await findUser(req);

        user.memory.data.email = req.body.data.email;
        await user.commit();

        req.session.currentUser = req.body.data.email;

        return success();
    }
    
    changeUsername = async (req) => {
        loginCheck(req);
       
        let user = new req.db.User("user");
        let userData = await user.recallFromData("username", req.body.data.username);
        check(!userData, "Username already in use!");

        user = await findUser(req);

        user.memory.data.username = req.body.data.username;
        await user.commit();

        return success();
    }

    deleteUserPermanently = async (req) => {
        loginCheck(req);
        
        await user.findOneAndDelete().where("data.email").equals(req.session.currentUser);
        await req.session.destroy();

        return success("Account deleted.");
    }

    getUserInventory = async (req) => {
        loginCheck(req);
        let user = await findUser(req);
        let inv = user.memory.data.inventory;
    
        check(inv, "User inventory not found.");
    
        return success("User inventory found.", inv);
    }

    updateItemInInventory = async (req) => {
        check(req.body.data.name && req.body.data.amount, `${req.body.data.name} ${req.body.data.amount} Check Input!`);
    
        let item = new req.db.Item(req.body.data.name);
        let itemData = await item.recall();
    
        check(itemData, "Item not found in database.");
    
        let user = await findUser(req);
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
    
                        return success("Item emptied.", empty);
                    }
                    else {
                        await user.commit();
    
                        return success("Item offset.", inv[j]);
                    }
                }
                else {
                    return fail(`Unable to remove ${req.body.data.amount} ${req.body.data.name} 
                        from inventory because the inventory has only ${inv[j].amount}.` );
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
    
                return success("Item offset.", inv[inv.length - 1]);
            }
            else {
                return fail(`Unable to remove ${req.body.data.amount} ${req.body.data.name} 
                    from inventory because the inventory has none.`);
            }
        };
    }
    
    attributes = async (req) => {
        loginCheck(req);
    
        let user = await findUser(req);
    
        return success("Got user attributes.", user.memory.data.attributes);
    }

    checkAttribute = async (req) => {
        loginCheck(req);
    
        let user = await findUser(req);
        let att = user.memory.data.attributes;
    
        if (att[req.body.data.check] >= req.body.data.against) {
            return success("Passed check.")
        }
        else return fail("Failed check.");
    }

    setAttribute = async (req) => {
        loginCheck(req);
    
        let user = await findUser(req);
    
        user.memory.data.attributes[req.body.data.change] = req.body.data.to;
        await user.commit();
    
        return success("Attributes set.", user.memory.data.attributes);
    }

    incrementAttribute = async (req) => {
        loginCheck(req);
    
        let user = await findUser(req);
        let att = user.memory.data.attributes;
    
        if (att[req.body.data.change] < req.body.data.max) {
            att[req.body.data.change]++;
            await user.commit();
    
            return success("Attribute incremented.", att[req.body.data.change]);
        } 
        else return fail("Attribute maxed.", att[req.body.data.change]);
    }
}

