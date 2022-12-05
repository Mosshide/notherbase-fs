import express from "express";
const router = express.Router();
import bcrypt from "bcrypt";

// Import my Data
import { user, inventory, sendMail } from "../models/index.js";

import authCheck from "./authCheck.js";

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

router.get("/basic", async function(req, res) {
    try {
        if (req.session.currentUser) {
            let foundUser = await user.findById(req.session.currentUser, 'username email');
    
            res.status(200).send(foundUser);
        }
        else {
            res.status(401).send("Please login first!");
        }
    }
    catch(err) {
        console.log(err);
        res.status(500).end();
    }
});

router.get("/logout", authCheck, async function(req, res) {
    try {
        await req.session.destroy();

        res.redirect(`/`);
    }
    catch {
        console.log(err);
    }
});

router.post("/logout", authCheck, async function(req, res) {
    try {
        await req.session.destroy();

        res.send("done");
    }
    catch {
        console.log(err);
    }
});

router.get("/all", async function(req, res) {
    try {
        let foundUsers = await user.find({}, 'username coin home authLevels location attributes');

        res.status(200).send({ foundUsers: foundUsers });
    }
    catch(err) {
        res.status(500).end();
        console.log(err);
    }
});

router.get("/password-reset", async function(req, res) {
    try {
        let foundUser = await user.findOne({ email: req.query.email });
        
        if (foundUser) {
            foundUser.reset.token = Math.floor(Math.random() * 9999);
            foundUser.reset.exp = Date.now() + (1000 * 60 * 30);
            
            await foundUser.save();

            sendMail.passwordReset(req.query.email, foundUser.reset.token);

            res.status(200).send("Reset link sent!");
        }
        else {
            res.status(401).send("Failed: user not found!");
        }
    }
    catch(err) {
        console.log(err);

        res.status(500).send("Update Failed: Database error!");
    }
});

router.post("/password-reset", async function(req, res) {
    try {
        const foundUser = await user.findOne({ "reset.token": req.body.token });

        if (foundUser) {
            if (foundUser.reset.exp > Date.now()) {
                if (req.body.password !== req.body.confirmation) res.status(400).send("Passwords must match!");
                else {
                    foundUser.reset = {};

                    const salt = await bcrypt.genSalt(10);
                    const hash = await bcrypt.hash(req.body.password, salt);
        
                    foundUser.password = hash;
                    await foundUser.save();

                    res.status(200).send("Password changed successfully!");
                }
            }
            else res.status(498).send("Reset token expired!");
        }
        else {
            res.status(404).send("Reset token not valid!");
        }
    }
    catch(err) {
        console.log(err);

        res.status(500).send("Internal Server Error!");
    }
});

router.get("/attributes", async function(req, res) {
    try {
        if (req.session.currentUser) {
            let foundUser = await getAttributes(req.session.currentUser);

            res.status(200).send(foundUser.attributes);
        }
        else {
            res.status(401).send("Please login first!");
        }
    }
    catch(err) {
        res.status(500).end();
        console.log(err);
    }
});

router.get("/attributes/check", authCheck, async function(req, res) {
    try {
        if (req.session.currentUser) {
            let foundUser = await getAttributes(req.session.currentUser);

            if (foundUser.attributes[req.query.check] >= parseInt(req.query.against)) {
                res.status(200).send("Pass");
            }
            else res.status(200).send("Fail");
        }
        else {
            res.status(401).send("Please login first!");
        }
    }
    catch(err) {
        res.status(500).end();
        console.log(err);
    }
});

router.post("/register", async function(req, res) {
    try {
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
    
            res.status(200).send("Registration Successful!");
        }
        else {
            res.status(400).send("Registration Failed: username taken!");
        }
    }
    catch(err) {
        console.log(err);

        res.status(500).send("Registration Failed: Database error!");
    }
});

router.post("/login", async function(req, res) {
    try {
        const foundAccount = await user.findOne({ email: req.body.email });

        if (foundAccount) {
            if (await bcrypt.compare(req.body.password, foundAccount.password)) {
                req.session.currentUser = foundAccount._id;

                res.status(200).send("Login successful!");
            }
            else {
                res.status(401).send("Login Failed: Password incorrect!");
            }
        }
        else {
            res.status(401).send("Login Failed: Email not found!");
        }
    }
    catch(err) {
        console.log(err);

        res.status(500).send("Login Failed: Database error!");
    }
});

router.post("/email", async function(req, res) {
    try {
        if (req.session.currentUser) {
            let foundAccount = await user.findOne({ email: req.body.email });

            if (!foundAccount) {
                let foundUser = await user.findById(req.session.currentUser);

                if (foundUser) {
                    foundUser.email = req.body.email;
                    await foundUser.save();

                    res.status(200).send("Update successful!");
                }
                else {
                    res.status(401).send("Update Failed: user not found!");
                }
            }
            else {
                res.status(401).send("Update Failed: email already in use!");
            }
        }
        else {
            res.status(401).send("Please login first!");
        }
    }
    catch(err) {
        console.log(err);

        res.status(500).send("Update Failed: Database error!");
    }
});

router.post("/username", async function(req, res) {
    try {
        if (req.session.currentUser) {
            let foundAccount = await user.findOne({ username: req.body.username });

            if (!foundAccount) {
                let foundUser = await user.findById(req.session.currentUser);
        
                if (foundUser) {
                    foundUser.username = req.body.username;
                    await foundUser.save();
        
                    res.status(200).send("Update successful!");
                }
                else {
                    res.status(401).send("Update Failed: user not found!");
                }
            }
            else {
                res.status(401).send("Update Failed: username taken!");
            }
        }
        else {
            res.status(401).send("Please login first!");
        }
    }
    catch(err) {
        console.log(err);

        res.status(500).send("Update Failed: Database error!");
    }
});

router.post("/password", async function(req, res) {
    try {
        if (req.session.currentUser) {
            let foundUser = await user.findById(req.session.currentUser);
        
            if (foundUser) {
                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash(req.body.password, salt);
                foundUser.password = hash;
                await foundUser.save();

                res.status(200).send("Update successful!");
            }
            else {
                res.status(401).send("Update Failed: user not found!");
            }
        }
        else {
            res.status(401).send("Please login first!");
        }
    }
    catch(err) {
        console.log(err);

        res.status(500).send("Update Failed: Database error!");
    }
});

router.post("/attributes", async function(req, res) {
    try {
        if (req.session.currentUser) {
            let foundUser = await getAttributes(req.session.currentUser);

            if (foundUser) {
                foundUser.attributes[req.body.change] = parseInt(req.body.to);
                await foundUser.save();

                res.status(200).send("AttUp successful!");
            }
            else {
                res.status(401).send("AttUp Failed: user not found!");
            }
        }
        else {
            res.status(401).send("Please login first!");
        }
    }
    catch(err) {
        console.log(err);

        res.status(500).send("AttUp Failed: Database error!");
    }
});

router.post("/attributes/increment", async function(req, res) {
    try {
        if (req.session.currentUser) {
            let foundUser = await getAttributes(req.session.currentUser);

            if (foundUser) {
                if (foundUser.attributes[req.body.change] < req.body.max) {
                    foundUser.attributes[req.body.change]++;
                    await foundUser.save();
                    res.status(200).send({ newLevel: foundUser.attributes[req.body.change] });
                } 
                else {
                    res.status(304).send({ newLevel: foundUser.attributes[req.body.change] });
                }
            }
            else {
                res.status(401).send("AttUp Failed: user not found!");
            }
        }
        else {
            res.status(401).send("Please login first!");
        }
    }
    catch(err) {
        console.log(err);

        res.status(500).send("AttUp Failed: Database error!");
    }
});

router.delete("/", authCheck, async function(req, res) {
    try {
        if (req.session.currentUser) {
            await user.findByIdAndDelete(req.session.currentUser);
            await req.session.destroy();

            res.redirect("/");
        }
        else {
            res.status(401).send("Please login first!");
        }
    }
    catch {
        console.log(err);
        res.status(500).send("Delete Failed: Database error!");
    }
});

export default router;