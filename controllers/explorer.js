import express from "express";
import path from 'node:path';
import fs from 'fs';
import { nextTick } from "node:process";

let router = express.Router();

router.post(`/:region/:area/:poi/:detail/serve/:script`, async function(req, res) {
    try {
        let currentAreaRoute = `${req.params.region}/${req.params.area}/${req.params.poi}`;
        let currentRoute = `${req.params.region}/${req.params.area}/${req.params.poi}/${req.params.detail}`;
        const foundUser = await req.db.user.findById(req.session.currentUser);

        let scriptResult = await require(`${req.worldDir}/${currentAreaRoute}/server-scripts/${req.params.script}.js`)(db, currentRoute, foundUser, req.body);
        res.send({ scriptResult: scriptResult });
    }
    catch(err) {
        console.log(err);
        res.status(500).end();
    }
});

router.get(`/recall`, async function(req, res) {
    try {
        let exists = await req.db.detail.exists({ 
            route: req.query.route,
            service: req.query.service,
            scope: "local",
            user: req.session.currentUser
        });

        if (!exists) {
            await req.db.detail.create({
                _lastUpdate: Date.now(),
                route: req.query.route,
                service: req.query.service,
                scope: "local",
                user: req.session.currentUser,
                data: {}
            });
        }

        let found = await req.db.detail.findOne({ 
            route: req.query.route,
            service: req.query.service,
            scope: "local",
            user: req.session.currentUser
        });

        if (new Date(found._lastUpdate) > new Date(req.query._lastUpdate)) {
            res.send({
                isUpToDate: false,
                data: found.data
            });
        }
        else res.send({
            isUpToDate: true,
            data: null
        });
    }
    catch(err) {
        console.log(err);
        res.status(500).end();
    }
});

router.post(`/commit`, async function(req, res) {
    try {
        await req.db.detail.updateOne({ 
            route: req.body.route,
            service: req.body.service,
            scope: "local",
            user: req.session.currentUser
        }, { 
            route: req.body.route,
            service: req.body.service,
            scope: "local",
            user: req.session.currentUser,
            _lastUpdate: req.body.time,
            data: req.body.data
        }, {
            upsert: true
        });

        res.send("Update successful!");
    }
    catch(err) {
        console.log(err);
        res.status(500).end();
    }
});

router.get(`/:region/:area/:poi/:detail`, async function(req, res, next) {
    try {
        let main = `${req.worldDir}/${req.params.region}/${req.params.area}/${req.params.poi}/views/${req.params.detail}`;

        if (fs.existsSync(main + ".ejs")) {
            const foundUser = await req.db.user.findById(req.session.currentUser);
            const foundInventory = await req.db.inventory.findOne({ user: req.session.currentUser }).populate("items.item");

            let context = {
                siteTitle: `NotherBase - ${req.params.detail}`,
                user: foundUser,
                main: main,
                pov: req.query.pov,
                inventory: foundInventory,
                query: req.query,
                dir: req.worldDir,
                route: `/${req.params.region}/${req.params.area}/${req.params.poi}/${req.params.detail}`
            }
    
            await res.render(`explorer`, context);
        } 
        else next();
    }
    catch(err) {
        console.log(err);
        res.status(500).end();
    }
});

router.get(`/:region/:area/:poi`, async function(req, res, next) {
    try {
        let main = `${req.worldDir}/${req.params.region}/${req.params.area}/${req.params.poi}/views/index`;

        if (fs.existsSync(main + ".ejs")) {
            const foundUser = await req.db.user.findById(req.session.currentUser);
            const foundInventory = await req.db.inventory.findOne({ user: req.session.currentUser }).populate("items.item");

            let context = {
                siteTitle: `NotherBase - ${req.params.poi}`,
                user: foundUser,
                main: main,
                pov: req.query.pov,
                inventory: foundInventory,
                query: req.query,
                dir: req.worldDir,
                route: `/${req.params.region}/${req.params.area}/${req.params.poi}`
            }
    
            await res.render(`explorer`, context);
        } 
        else next();
    }
    catch(err) {
        console.log(err);
        res.status(500).end();
    }
});

// start location
router.get("/", function(req, res) {
    res.redirect("/the-front");
});

export default router;