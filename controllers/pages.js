const express = require("express");
const router = express.Router();
const fs = require('fs');

const page = require("../models").page;

module.exports = function name(path)
{
    let files = fs.readdirSync(path);

    router.get('/pages/db', async function (req, res) {
        try {
            if (req.query.type === "global") {
                let foundPage = await page.findOne({name: req.query.name, type: "global"});
        
                if (!foundPage) res.status(404).end();
                else res.status(200).send(foundPage);
            }
            else {
                let foundPage = await page.findOne({name: req.query.name, user: req.session.currentUser});
        
                if (!foundPage) res.status(404).end();
                else res.status(200).send(foundPage);
            }
        }
        catch(err) {
            res.status(500).end();
            console.log(err);
        }
    });

    router.post('/pages/db', async function (req, res) {
        try {
            let foundPage;

            if (req.query.type === "global") {
                foundPage = await page.findOne({name: req.query.name, type: "global"});
            }
            else {
                foundPage = await page.findOne({name: req.query.name, user: req.session.currentUser});
            }
            
            if (!foundGame) {
                await game.create({
                    name: req.body.name,
                    type: req.query.type,
                    user: req.session.currentUser,
                    data: req.query.data
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

    files.forEach(file => {
        file = file.slice(0, -4);

        router.get(`/${file}`, function(req, res) {
            res.render(`${path}/${file}.ejs`);
        });
    });

    return router;
}