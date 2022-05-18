const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

// Import my Data
const { user, inventory } = require("../models");

const authCheck = require("./authCheck");

router.post("/register", async function(req, res) {
    try {
        const foundAccount = await user.findOne({ username: req.body.username });

        if (!foundAccount) {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(req.body.password, salt);

            let qAuth = await user.create({
                username: req.body.username,
                password: hash,
                email: "temp@example.com",
                coin: 0,
                home: "/",
                authLevels: [ "Basic" ],
                location: "The Front",
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
        const foundAccount = await user.findOne({ username: req.body.username });

        if (foundAccount) {
            if (await bcrypt.compare(req.body.password, foundAccount.password)) {
                req.session.currentUser = foundAccount._id;
                req.session.currentUserFull = foundAccount;

                res.status(200).send("Login successful!");
            }
            else {
                res.status(401).send("Login Failed: Password incorrect!");
            }
        }
        else {
            res.status(401).send("Login Failed: username not found!");
        }
    }
    catch(err) {
        console.log(err);

        res.status(500).send("Login Failed: Database error!");
    }
});

router.post("/attributes", async function(req, res) {
    try {
        let foundUser = await user.findById(req.session.currentUser, 'attributes');

        if (foundUser) {
            if (!foundUser.attributes || foundUser.attributes == {}) {
                foundUser.attributes = {
                    translation: 0,
                    strength: 0,
                    agility: 0,
                    defense: 0
                }
    
                await foundUser.save();
            }

            foundUser.attributes[req.body.change] = parseInt(req.body.to);
            await foundUser.save();

            res.status(200).send("AttUp successful!");
        }
        else {
            res.status(401).send("AttUp Failed: user not found!");
        }
    }
    catch(err) {
        console.log(err);

        res.status(500).send("Login Failed: Database error!");
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

router.get("/all", authCheck, async function(req, res) {
    try {
        let foundUsers = await user.find({}, 'username coin home authLevels location attributes');

        res.status(200).send({ foundUsers: foundUsers });
    }
    catch(err) {
        res.status(500).end();
        console.log(err);
    }
});

router.get("/attributes", authCheck, async function(req, res) {
    try {
        let foundUser = await user.findById(req.session.currentUser);

        if (!foundUser.attributes || foundUser.attributes == {}) {
            foundUser.attributes = {
                translation: 0,
                strength: 0,
                agility: 0,
                defense: 0
            }

            await foundUser.save();
        }

        res.status(200).send(foundUser);
    }
    catch(err) {
        res.status(500).end();
        console.log(err);
    }
});

router.delete("/", authCheck, async function(req, res) {
    try {
        const found = await user.findByIdAndDelete(req.session.currentUser);

        if (!found) console.log("Could not find account. No deletion!");

        await req.session.destroy();

        res.redirect("/");
    }
    catch {
        console.log(err);
    }
});

module.exports = router;

