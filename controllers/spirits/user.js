import bcrypt from "bcrypt";
import {loginCheck, check, findUser, fail, success} from "./util.js";

export default {
    logout: async (req) => {
        loginCheck(req);

        await req.session.destroy();

        return success("Logged out.");
    },
    sendPasswordReset: async (req) => {
        let reset = new req.db.User("reset");

        let token = Math.floor(Math.random() * 9999);

        await reset.create({
            email: req.body.data.email, 
            token: token, 
            tokenExp: Date.now() + (1000 * 60 * 30)
        });

        req.db.SendMail.passwordReset(req.body.data.email, token);

        return success("Password reset.", {});
    },
    changePassword: async (req) => {
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
    },
    register: async (req) => {
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
    },
    login: async (req) => {
        let user = await findUser(req, req.body.data.email);

        let passResult = await bcrypt.compare(req.body.data.password, user.memory.data.password);
        check(passResult, "Password doesn't match.");

        req.session.currentUser = req.body.data.email;

        return success("Logged in.");
    },
    changeUserEmail: async (req) => {
        loginCheck(req);

        let user = new req.db.User("user", req.body.data.email);
        let userData = await user.recall();

        check(!userData, "Email already in use!");

        user = await findUser(req);

        user.memory.data.email = req.body.data.email;
        await user.commit();

        req.session.currentUser = req.body.data.email;

        return success();
    },
    changeUsername: async (req) => {
        loginCheck(req);
       
        let user = new req.db.User("user");
        let userData = await user.recallFromData("username", req.body.data.username);
        check(!userData, "Username already in use!");

        user = await findUser(req);

        user.memory.data.username = req.body.data.username;
        await user.commit();

        return success();
    },
    deleteUserPermanently: async (req) => {
        loginCheck(req);
        
        await user.findOneAndDelete().where("data.email").equals(req.session.currentUser);
        await req.session.destroy();

        return success("Account deleted.");
    }
}

