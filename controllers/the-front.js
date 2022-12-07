import express from "express";
let router = express.Router();
import fs from 'fs';

router.post(`/serve/:script`, async function(req, res) {
    try {  
        let script = await import(`${req.frontDir}/server-scripts/${req.params.script}.js`);
        let scriptResult = await script.default(req.db, "/the-front", req.session.currentUser, req.body);
        res.send(scriptResult);
    }
    catch(err) {
        console.log(err);
        res.status(500).end();
    }
});

router.get(`/:detail`, async function(req, res, next) {
    try {
        let main = `${req.frontDir}/views/${req.params.detail}`;

        if (fs.existsSync(main + ".ejs")) {
            const foundUser = await req.db.user.findById(req.session.currentUser);
            const foundInventory = await req.db.inventory.findOne({ user: req.session.currentUser }).populate("items.item");
    
    
            let context = {
                siteTitle: `NotherBase - ${req.params.detail}`,
                user: foundUser,
                main: main,
                inventory: foundInventory,
                query: req.query,
                dir: req.frontDir,
                route: `/the-front/${req.params.detail}`
            }
    
            res.render(`explorer`, context);
        }
        else next();
    }
    catch(err) {
        console.log(err);
        res.status(500).end();
    }
});

router.get(`/`, async function(req, res) {
    try {
        let main = `${req.frontDir}/views/index`;
        const foundUser = await req.db.user.findById(req.session.currentUser);
        const foundInventory = await req.db.inventory.findOne({ user: req.session.currentUser }).populate("items.item");

        let context = {
            siteTitle: `NotherBase - The Front`,
            user: foundUser,
            main: main,
            inventory: foundInventory,
            query: req.query,
            dir: req.frontDir,
            route: `/the-front`
        }

        res.render(`explorer`, context);
    }
    catch(err) {
        console.log(err);
        res.status(500).end();
    }
});

export default router;