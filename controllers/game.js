import express from "express";
const router = express.Router();

import { game } from "../models/index.js";

router.get("/all", async function(req, res) {
    try {
        let foundGames = await game.find({name: req.query.name});

        res.status(200).send({ foundGames: foundGames });
    }
    catch(err) {
        res.status(500).end();
        console.log(err);
    }
});

router.get("/one", async function(req, res) {
    try {
        let foundGame = await game.findOne({_id: req.query._id});

        if (!foundGame) res.status(404).end();
        else res.status(200).send({ foundGame: foundGame });
    }
    catch(err) {
        res.status(500).end();
        console.log(err);
    }
});

router.post("/", async function(req, res) {
    try {
        let foundGame = await game.findOne({_id: req.query._id});

        if (!foundGame) {
            await game.create({
                name: req.body.name,
                shortDescription: req.body.shortDescription,
                fullDescription: req.body.fullDescription
            });

            res.status(200).end();
        } 
        else {
            foundGame.data = req.query.data;
            foundGame.markModified("data");
            await foundGame.save();

            res.status(200).end();
        }
    }
    catch(err) {
        res.status(500).end();
        console.log(req.query);
        console.log(err);
    }
});

export default router;