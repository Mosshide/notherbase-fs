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

    explore = async (main, siteTitle, req, res, next) => {
        try {
            if (fs.existsSync(main + ".ejs")) {
                let user = new req.db.User("user", req.session.currentUser);
                let userData = (await user.recall()).data;

                let context = {
                    siteTitle: siteTitle,
                    userID: user._ID,
                    user: userData,
                    main: main,
                    query: req.query,
                    dir: req.frontDir,
                    route: req.path
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

    page = async (req, res, next) => {
        if (fs.existsSync(`${req.contentPath}/${req.params.page}.ejs`)) {
            let user = new req.db.User("user", req.session.currentUser);
            let userData = (await user.recall()).data;
    
            res.render(`${req.contentPath}/${req.params.page}.ejs`, {
                user: userData,
                query: req.query
            });
        } 
        else {
            next();
        }
    }

    front = async (req, res, next) => {
        let main = `${req.contentPath}/the-front/views/index`;
        this.explore(main, `NotherBase - The Front`, req, res, next);
    }

    frontDetail = async (req, res, next) => {
        let main = `${req.contentPath}/the-front/views/${req.params.detail}`;
        this.explore(main, `NotherBase - ${req.params.detail}`, req, res, next);
    }

    poi = async (req, res, next) => {
        let main = `${req.contentPath}/explorer${req.path}/views/index`;
        this.explore(main, `NotherBase - ${req.params.poi}`, req, res, next);
    }

    detail = async (req, res, next) => {
        let main = `${req.contentPath}/explorer/${req.params.region}/${req.params.area}/${req.params.poi}/views/${req.params.detail}`;
        this.explore(main, `NotherBase - ${req.params.detail}`, req, res, next);
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