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

export default {
    basic: async (req, res) => {
        if (req.session.currentUser) {
            let foundUser = await user.findById(req.session.currentUser, 'username email');
    
            return {
                status: "success",
                message: "Found user details.",
                data: foundUser
            };
        }
        else return {
            status: "failed",
            message: "Please login first!",
            data: null
        }
    },
    logout: async (req, res) => {
        if (req.session.currentUser) {
            await req.session.destroy();

            return {
                status: "success",
                message: "Logged out.",
                data: null
            };
        }
        else return {
            status: "failed",
            message: "Please login first!",
            data: null
        }
    },
    all: async (req, res) => {
        let foundUsers = await user.find({}, 'username coin home authLevels location attributes email');

        return {
            status: "success",
            message: "Found user details.",
            data: foundUsers
        }
    },
    resetPassword: async (req, res) => {
        let foundUser = await user.findOne({ email: req.query.email });
        
        if (foundUser) {
            foundUser.reset.token = Math.floor(Math.random() * 9999);
            foundUser.reset.exp = Date.now() + (1000 * 60 * 30);
            
            await foundUser.save();

            sendMail.passwordReset(req.query.email, foundUser.reset.token);

            return {
                status: "success",
                message: "Reset link sent.",
                data: null
            };
        }
        else {
            return {
                status: "failed",
                message: "User not found.",
                data: null
            };
        }
    },
    newPassword: async (req, res) => {
        const foundUser = await user.findOne({ "reset.token": req.body.token });

        if (foundUser) {
            if (foundUser.reset.exp > Date.now()) {
                if (req.body.password !== req.body.confirmation) {
                    return {
                        status: "failed",
                        message: "Passwords must match!",
                        data: null
                    }
                }
                else {
                    foundUser.reset = {};

                    const salt = await bcrypt.genSalt(10);
                    const hash = await bcrypt.hash(req.body.password, salt);
        
                    foundUser.password = hash;
                    await foundUser.save();

                    return {
                        status: "success",
                        message: "Password changed successfully!",
                        data: null
                    }
                }
            }
            else return {
                status: "failed",
                message: "Reset token expired!",
                data: null
            };
        }
        else {
            return {
                status: "failed",
                message: "Reset token not valid!",
                data: null
            };
        }
    },
    attributes: async (req, res) => {
        if (req.session.currentUser) {
            let foundUser = await getAttributes(req.session.currentUser);

            return {
                status: "success",
                message: "Got user attributes.",
                data: foundUser.attributes
            };
        }
        else return {
            status: "failed",
            message: "Please login first!",
            data: null
        }
    },
    checkAttribute: async (req, res) => {
        if (req.session.currentUser) {
            let foundUser = await getAttributes(req.session.currentUser);

            if (foundUser.attributes[req.query.check] >= parseInt(req.query.against)) {
                return {
                    status: "success",
                    message: "Passed check.",
                    data: null
                }
            }
            else return {
                status: "failed",
                message: "Failed check.",
                data: null
            };
        }
        else return {
            status: "failed",
            message: "Please login first!",
            data: null
        }
    },
    setAttributes: async (req, res) => {
        if (req.session.currentUser) {
            let foundUser = await getAttributes(req.session.currentUser);

            if (foundUser) {
                foundUser.attributes[req.body.change] = parseInt(req.body.to);
                await foundUser.save();

                return {
                    status: "success",
                    message: "Attributes set.",
                    data: null
                }
            }
            else {
                return {
                    status: "failed",
                    message: "User not found.",
                    data: null
                }
            }
        }
        else return {
            status: "failed",
            message: "Please login first!",
            data: null
        }
    },
    incrementAttribute: async (req, res) => {
        if (req.session.currentUser) {
            let foundUser = await getAttributes(req.session.currentUser);

            if (foundUser) {
                if (foundUser.attributes[req.body.change] < req.body.max) {
                    foundUser.attributes[req.body.change]++;
                    await foundUser.save();

                    return {
                        status: "success",
                        message: "Attribute incremented.",
                        data: foundUser.attributes[req.body.change]
                    }
                } 
                else {
                    return {
                        status: "failed",
                        message: "Attribute maxed.",
                        data: foundUser.attributes[req.body.change]
                    }
                }
            }
            else {
                return {
                    status: "failed",
                    message: "User not found!",
                    data: null
                }
            }
        }
        else return {
            status: "failed",
            message: "Please login first!",
            data: null
        }
    },
    register: async (req, res) => {
        let foundAccount = await user.findOne({ username: req.body.username });

        if (!foundAccount) {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(req.body.password, salt);

            let qAuth = await user.create({
                username: req.body.username,
                password: hash,
                email: req.body.email,
                coin: 0,
                home: "/",
                authLevels: [ "Basic" ],
                location: "/the-front",
                attributes: {
                    translation: 0,
                    strength: 0,
                    agility: 0,
                    defense: 0
                }
            });

            await inventory.create({
                user: qAuth._id,
                items: []
            });

            return {
                status: "success",
                message: "Registration successful!",
                data: null
            };
        }
        else {
            return {
                status: "failed",
                message: "Registration Failed: username taken!",
                data: null
            };
        }
    },
    login: async (req, res) => {
        const foundAccount = await user.findOne({ email: req.body.email });

        if (foundAccount) {
            if (await bcrypt.compare(req.body.password, foundAccount.password)) {
                req.session.currentUser = foundAccount._id;

                return {
                    status: "success",
                    message: "Logged in.",
                    data: null
                }
            }
            else {
                return {
                    status: "failed",
                    message: "Failed to login",
                    data: null
                }
            }
        }
        else {
            return {
                status: "failed",
                message: "User not found.",
                data: null
            };
        }
    },
    email: async (req, res) => {
        if (req.session.currentUser) {
            let foundAccount = await user.findOne({ email: req.body.email });

            if (!foundAccount) {
                let foundUser = await user.findById(req.session.currentUser);

                if (foundUser) {
                    foundUser.email = req.body.email;
                    await foundUser.save();

                    return {
                        status: "success",
                        message: "Update successful!",
                        data: null
                    }
                }
                else {
                    return {
                        status: "failed",
                        message: "User not found.",
                        data: null
                    }
                }
            }
            else {
                return {
                    status: "failed",
                    message: "Email already in use.",
                    data: null
                }
            }
        }
        else return {
            status: "failed",
            message: "Please login first!",
            data: null
        }
    },
    username: async (req, res) => {
        if (req.session.currentUser) {
            let foundAccount = await user.findOne({ username: req.body.username });

            if (!foundAccount) {
                let foundUser = await user.findById(req.session.currentUser);
        
                if (foundUser) {
                    foundUser.username = req.body.username;
                    await foundUser.save();
        
                    return {
                        status: "success",
                        message: "Update successful!",
                        data: null
                    }
                }
                else {
                    return {
                        status: "failed",
                        message: "User not found.",
                        data: null
                    }
                }
            }
            else {
                return {
                    status: "failed",
                    message: "Username already taken.",
                    data: null
                }
            }
        }
        else return {
            status: "failed",
            message: "Please login first!",
            data: null
        }
    },
    delete: async (req, res) => {
        if (req.session.currentUser) {
            await user.findByIdAndDelete(req.session.currentUser);
            await req.session.destroy();

            return {
                status: "success",
                message: "Account deleted!",
                data: null
            };
        }
        else return {
            status: "failed",
            message: "Please login first!",
            data: null
        }
    }
}

