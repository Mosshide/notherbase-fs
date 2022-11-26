const db = require("../models");
const path = require('path');
const fs = require("fs");

let router = require("express").Router();

const explorer = async function explorer(worldPath, voidPath) {
    router.post(`/:region/:area/:poi/:detail/serve/:script`, async function(req, res) {
        try {
            let currentAreaRoute = `${req.params.region}/${req.params.area}/${req.params.poi}`;
            let currentRoute = `${req.params.region}/${req.params.area}/${req.params.poi}/${req.params.detail}`;

            if (await db.poi.exists({ route: currentRoute, type: "global" }) === false) {
                await db.poi.create({
                    route: currentRoute,
                    name: req.params.detail,
                    type: "global",
                    data: {}
                });
            }

            if (await db.poi.exists({ route: currentRoute, user: req.session.currentUser }) === false) {
                await db.poi.create({
                    route: currentRoute,
                    name: req.params.detail,
                    type: "user",
                    user: req.session.currentUser,
                    data: {}
                });
            }
    
            let scriptResult = await require(`${worldPath}/${currentAreaRoute}/server-scripts/${req.params.script}.js`)(db, currentRoute, req.session.currentUser, req.body);
            res.send({ scriptResult: scriptResult });
        }
        catch(err) {
            console.log(err);
            res.status(500).end();
        }
    });

    router.get(`/recall`, async function(req, res) {
        try {
            let exists = await db.detail.exists({ 
                route: req.query.route,
                service: req.query.service,
                scope: "local",
                user: req.session.currentUser
            });

            if (!exists) {
                await db.detail.create({
                    _lastUpdate: Date.now(),
                    route: req.query.route,
                    service: req.query.service,
                    scope: "local",
                    user: req.session.currentUser,
                    data: {}
                });
            }

            let found = await db.detail.findOne({ 
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
            await db.detail.updateOne({ 
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
    
    router.get(`/:region/:area/:poi/:detail`, async function(req, res) {
        try {
            const foundUser = await db.user.findById(req.session.currentUser);
            const foundInventory = await db.inventory.findOne({ user: req.session.currentUser }).populate("items.item");
    
            let main = `${worldPath}/${req.params.region}/${req.params.area}/${req.params.poi}/views/${req.params.detail}`;

            if (fs.existsSync(main + ".ejs")) {
                let context = {
                    siteTitle: `NotherBase - ${req.params.detail}`,
                    user: foundUser,
                    main: main,
                    pov: req.query.pov,
                    inventory: foundInventory,
                    query: req.query,
                    dir: worldPath,
                    route: `/${req.params.region}/${req.params.area}/${req.params.poi}/${req.params.detail}`
                }
        
                await res.render(`explorer`, context);
            } 
            else {
                res.render(`explorer`, 
                {
                    siteTitle: "NotherBase | The Void",
                    user: null,
                    inventory: null,
                    main: `${voidPath}/index`,
                    route: `/void`
                });
            }
        }
        catch(err) {
            console.log(err);
            res.status(500).end();
        }
    });
    
    router.get(`/:region/:area/:poi`, async function(req, res) {
        try {
            const foundUser = await db.user.findById(req.session.currentUser);
            const foundInventory = await db.inventory.findOne({ user: req.session.currentUser }).populate("items.item");
    
            let main = `${worldPath}/${req.params.region}/${req.params.area}/${req.params.poi}/views/index`;
    
            if (fs.existsSync(main + ".ejs")) {
                let context = {
                    siteTitle: `NotherBase - ${req.params.poi}`,
                    user: foundUser,
                    main: main,
                    pov: req.query.pov,
                    inventory: foundInventory,
                    query: req.query,
                    dir: worldPath,
                    route: `/${req.params.region}/${req.params.area}/${req.params.poi}`
                }
        
                await res.render(`explorer`, context);
            } 
            else {
                res.render(`explorer`, 
                {
                    siteTitle: "NotherBase | The Void",
                    user: null,
                    inventory: null,
                    main: `${voidPath}/index`,
                    route: `/void`
                });
            }
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
    
    //the void
    router.use(function(req, res, next){
        res.render(`explorer`, 
        {
            siteTitle: "NotherBase | The Void",
            user: null,
            inventory: null,
            main: `${voidPath}/index`,
            route: `/void`
        });
    });
    
    return router;
}

module.exports = explorer;