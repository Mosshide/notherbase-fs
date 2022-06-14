const express = require("express");
const router = express.Router();

// Import my Data
const items = require("../models/item");

router.get("/all", async function(req, res) {
    try {
        let foundItems = await items.find({});

        res.status(200).send({ foundItems: foundItems });
    }
    catch(err) {
        res.status(500).end();
        console.log(err);
    }
});

router.get("/", async function(req, res) {
    try {
        let foundItem = await items.findOne({ name: req.query.name });

        res.status(200).send({ foundItem: foundItem });
    }
    catch(err) {
        res.status(500).end();
        console.log(err);
    }
});

router.post("/", async function(req, res) {
    try {
        if (!req.body.id) {
            await items.create({
                name: req.body.name,
                shortDescription: req.body.shortDescription,
                fullDescription: req.body.fullDescription
            });
        }
        else {
            let foundItem = await items.findById(req.body.id);

            if (foundItem) {
                foundItem.name = req.body.name;
                foundItem.shortDescription = req.body.shortDescription;
                foundItem.fullDescription = req.body.fullDescription;
                await foundItem.save();
            }
        }

        res.status(200).end();
    }
    catch(err) {
        res.status(500).end();
        console.log(err);
    }
});

router.post("/delete", async function(req, res) {
    try {
        await items.findByIdAndDelete(req.body.id);

        res.status(200).end();
    }
    catch(err) {
        res.status(500).end();
        console.log(err);
    }
});

module.exports = router;