const front = async function front(dir) {
    const db = require("../models");
    const path = require('path');
    
    let router = require("express").Router();
    
    router.post(`/serve/:script`, async function(req, res) {
        try {
            let currentRoute = `/${req.params.region}/${req.params.area}/${req.params.poi}/${req.params.detail}`;

            let foundPoi = await db.poi.findOne({ route: currentRoute, type: "global" });

            if (foundPoi === null) {
                db.poi.create({
                    route: currentRoute,
                    name: req.params.detail,
                    type: "global",
                    global: {}
                });
            }
    
            let scriptResult = await require(`${worldPath}/${currentRoute}/server-scripts/${req.params.script}.js`)(db, currentRoute, req.session.currentUser, req.body);
            res.send(scriptResult);
        }
        catch(err) {
            console.log(err);
            res.status(500).end();
        }
    });
    
    router.get(`/:detail`, async function(req, res) {
        try {
            const foundUser = await db.user.findById(req.session.currentUser);
            const foundInventory = await db.inventory.findOne({ user: req.session.currentUser }).populate("items.item");
    
            let main = `${dir}/views/${req.params.detail}`;
    
            let context = {
                siteTitle: `NotherBase - ${req.params.detail}`,
                user: foundUser,
                main: main,
                pov: req.query.pov,
                inventory: foundInventory,
                query: req.query,
                dir: dir,
                path: path
            }
    
            await res.render(`explorer`, context);
        }
        catch(err) {
            console.log(err);
            res.status(500).end();
        }
    });
    
    router.get(`/`, async function(req, res) {
        try {
            const foundUser = await db.user.findById(req.session.currentUser);
            const foundInventory = await db.inventory.findOne({ user: req.session.currentUser }).populate("items.item");
    
            let main = `${dir}/views/index`;
    
            let context = {
                siteTitle: `NotherBase - The Front`,
                user: foundUser,
                main: main,
                pov: req.query.pov,
                inventory: foundInventory,
                query: req.query,
                dir: dir,
                path: path
            }
    
            await res.render(`explorer`, context);
        }
        catch(err) {
            console.log(err);
            res.status(500).end();
        }
    });
    
    return router;
}

module.exports = front;