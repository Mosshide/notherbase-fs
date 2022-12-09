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
        console.log(req.session.currentUser);
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
            let user = new req.db.User("user", req.session.currentUser);
            let userData = (await user.recall()).data;
            //const foundInventory = await req.db.inventory.findOne({ user: req.session.currentUser }).populate("items.item");
    
            let context = {
                siteTitle: `NotherBase - The Front`,
                user: userData,
                main: main,
                inventory: null,
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
                let user = new req.db.User("user", req.session.currentUser);
                let userData = (await user.recall()).data;
                //const foundInventory = await req.db.inventory.findOne({ user: req.session.currentUser }).populate("items.item");
        
        
                let context = {
                    siteTitle: `NotherBase - ${req.params.detail}`,
                    user: userData,
                    main: main,
                    inventory: null,
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
            let main = `${req.contentPath}/explorer${req.path}/views/index`;
            console.log(main);
    
            if (fs.existsSync(main + ".ejs")) {
                let user = new req.db.User("user", req.session.currentUser);
                let userData = (await user.recall()).data;
                //const foundInventory = await req.db.inventory.findOne({ user: req.session.currentUser }).populate("items.item");
    
                let context = {
                    siteTitle: `NotherBase - ${req.params.poi}`,
                    user: userData,
                    main: main,
                    pov: req.query.pov,
                    inventory: null,
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
            let main = `${req.contentPath}/explorer/${req.params.region}/${req.params.area}/${req.params.poi}/views/${req.params.detail}`;
    
            if (fs.existsSync(main + ".ejs")) {
                let user = new req.db.User("user", req.session.currentUser);
                let userData = (await user.recall()).data;
                //const foundInventory = await req.db.inventory.findOne({ user: req.session.currentUser }).populate("items.item");
    
                let context = {
                    siteTitle: `NotherBase - ${req.params.detail}`,
                    user: userData,
                    main: main,
                    pov: req.query.pov,
                    inventory: null,
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