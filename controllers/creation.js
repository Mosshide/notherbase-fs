import express from "express";
import fs from 'fs';

export default class Creation {
    constructor() {
        this.router = express.Router();

        this.router.get("/", function(req, res) { res.redirect("/the-front"); });
        this.router.get(`/the-front`, this.front);
        this.router.get(`/the-front/:detail`, this.frontDetail);
        this.router.get(`/:page`, this.page);
        this.router.get(`/:region/:area/:poi`, this.authCheck, this.poi);
        this.router.get(`/:region/:area/:poi/:detail`, this.authCheck, this.detail);
        this.router.use(this.void);
    }

    authCheck = (req, res, next) => {
        if (req.session.currentUser) next();
        else res.redirect("/the-front");
    }

    page = async (req, res, next) => {
        if (fs.existsSync(`${req.contentPath}/${req.params.page}.ejs`)) {
            const foundUser = await req.db.user.findById(req.session.currentUser);
    
            res.render(`${req.contentPath}/${req.params.page}.ejs`, {
                user: foundUser,
                query: req.query
            });
        } 
        else {
            next();
        }
    }

    front = async (req, res) => {
        try {
            let main = `${req.contentPath}/the-front/views/index`;
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
    }

    frontDetail = async (req, res, next) => {
        try {
            let main = `${req.contentPath}/the-front/views/${req.params.detail}`;
    
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
    }

    poi = async (req, res, next) => {
        try {
            let main = `${req.contentPath}/views${req.path}/index`;
    
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
    }

    detail = async (req, res, next) => {
        try {
            let main = `${req.contentPath}/views${req.path}`;
    
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
    }

    void = async (req, res) => {
        res.render(`explorer`, 
        {
            siteTitle: "NotherBase | The Void",
            user: null,
            inventory: null,
            main: `${req.contentPath}/void/index`,
            route: `/void`
        });
    }
}