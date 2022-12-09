import bcrypt from "bcrypt";

let getAttributes = async function getAttributes(userID) {
    try {
        let foundUser = await user.findById(userID, 'attributes');
    
        if (!foundUser.attributes || foundUser.attributes == {}) {
            foundUser.attributes = {
                translation: 0,
                strength: 0,
                agility: 0,
                defense: 0
            }
    
            await foundUser.save();
        }
    
        return foundUser;
    } 
    catch (err) {
        console.log(err);
        return null;
    }
}

let loginCheck = (req) => {
    check(req.session.currentUser, "Please login first.");
}

let findUser = async (req) => {
    let db = new req.db.User(req.body, req.session.currentUser);
    let foundUser = await db.recall().data;

    checkUser(foundUser);
}

let check = (checkee, failMsg) => {
    if (!checkee) throw {
        status: "failed",
        message: failMsg,
        data: null
    };
}

let success = (msg, data = null) => {
    return {
        status: "success",
        message: msg,
        data: data
    };
}

export default {
    logout: async (req) => {
        loginCheck(req);

        await req.session.destroy();

        return success("Logged out.");
    },
    resetPassword: async (req) => {
        let reset = new req.db.User("reset");

        let token = Math.floor(Math.random() * 9999);

        reset.commit({
            email: req.body.data.email, 
            token: token, 
            tokenExp: Date.now() + (1000 * 60 * 30)
        });

        req.SendMail.passwordReset(req.query.email, token);

        return success("Password reset.", {});
    },
    newPassword: async (req) => {
        let reset = new req.db.User("reset");
        let resetData = (await db.recallFromData("token", req.body.data.token)).data;

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
    attributes: async (req) => {
        loginCheck(req);

        let foundUser = await getAttributes(req.session.currentUser);

        return {
            status: "success",
            message: "Got user attributes.",
            data: foundUser.attributes
        };
    },
    checkAttribute: async (req) => {
        // if (req.session.currentUser) {
        //     let foundUser = await getAttributes(req.session.currentUser);

        //     if (foundUser.attributes[req.query.check] >= parseInt(req.query.against)) {
        //         return {
        //             status: "success",
        //             message: "Passed check.",
        //             data: null
        //         }
        //     }
        //     else return {
        //         status: "failed",
        //         message: "Failed check.",
        //         data: null
        //     };
        // }
        // else return {
        //     status: "failed",
        //     message: "Please login first!",
        //     data: null
        // }
    },
    setAttributes: async (req) => {
        // if (req.session.currentUser) {
        //     let foundUser = await getAttributes(req.session.currentUser);

        //     if (foundUser) {
        //         foundUser.attributes[req.body.change] = parseInt(req.body.to);
        //         await foundUser.save();

        //         return {
        //             status: "success",
        //             message: "Attributes set.",
        //             data: null
        //         }
        //     }
        //     else {
        //         return {
        //             status: "failed",
        //             message: "User not found.",
        //             data: null
        //         }
        //     }
        // }
        // else return {
        //     status: "failed",
        //     message: "Please login first!",
        //     data: null
        // }
    },
    incrementAttribute: async (req) => {
        // if (req.session.currentUser) {
        //     let foundUser = await getAttributes(req.session.currentUser);

        //     if (foundUser) {
        //         if (foundUser.attributes[req.body.change] < req.body.max) {
        //             foundUser.attributes[req.body.change]++;
        //             await foundUser.save();

        //             return {
        //                 status: "success",
        //                 message: "Attribute incremented.",
        //                 data: foundUser.attributes[req.body.change]
        //             }
        //         } 
        //         else {
        //             return {
        //                 status: "failed",
        //                 message: "Attribute maxed.",
        //                 data: foundUser.attributes[req.body.change]
        //             }
        //         }
        //     }
        //     else {
        //         return {
        //             status: "failed",
        //             message: "User not found!",
        //             data: null
        //         }
        //     }
        // }
        // else return {
        //     status: "failed",
        //     message: "Please login first!",
        //     data: null
        // }
    },
    register: async (req) => {
        let user = new req.db.User("user", req.body.data.email);
        let userData = (await user.recall()).data;

        check(!userData, "Email already in use!")

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(req.body.data.password, salt);

        await user.commit({
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
        let user = new req.db.User("user", req.body.data.email);
        let userData = (await user.recall()).data;

        check(userData, "User not found.");
        let passResult = await bcrypt.compare(req.body.data.password, userData.password);
        check(passResult, "Password doesn't match.");

        req.session.currentUser = req.body.data.email;

        return success("Logged in.");
    },
    email: async (req) => {
        // if (req.session.currentUser) {
        //     let foundAccount = await user.findOne({ email: req.body.email });

        //     if (!foundAccount) {
        //         let foundUser = await user.findById(req.session.currentUser);

        //         if (foundUser) {
        //             foundUser.email = req.body.email;
        //             await foundUser.save();

        //             return {
        //                 status: "success",
        //                 message: "Update successful!",
        //                 data: null
        //             }
        //         }
        //         else {
        //             return {
        //                 status: "failed",
        //                 message: "User not found.",
        //                 data: null
        //             }
        //         }
        //     }
        //     else {
        //         return {
        //             status: "failed",
        //             message: "Email already in use.",
        //             data: null
        //         }
        //     }
        // }
        // else return {
        //     status: "failed",
        //     message: "Please login first!",
        //     data: null
        // }
    },
    username: async (req) => {
        // if (req.session.currentUser) {
        //     let foundAccount = await user.findOne({ username: req.body.username });

        //     if (!foundAccount) {
        //         let foundUser = await user.findById(req.session.currentUser);
        
        //         if (foundUser) {
        //             foundUser.username = req.body.username;
        //             await foundUser.save();
        
        //             return {
        //                 status: "success",
        //                 message: "Update successful!",
        //                 data: null
        //             }
        //         }
        //         else {
        //             return {
        //                 status: "failed",
        //                 message: "User not found.",
        //                 data: null
        //             }
        //         }
        //     }
        //     else {
        //         return {
        //             status: "failed",
        //             message: "Username already taken.",
        //             data: null
        //         }
        //     }
        // }
        // else return {
        //     status: "failed",
        //     message: "Please login first!",
        //     data: null
        // }
    },
    delete: async (req) => {
        // if (req.session.currentUser) {
        //     await user.findByIdAndDelete(req.session.currentUser);
        //     await req.session.destroy();

        //     return {
        //         status: "success",
        //         message: "Account deleted!",
        //         data: null
        //     };
        // }
        // else return {
        //     status: "failed",
        //     message: "Please login first!",
        //     data: null
        // }
    }
}

