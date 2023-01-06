import express from "express";
import fs from 'fs';

export default class Creation {
    constructor() {
        this.router = express.Router();

        //home
        this.router.get("/", function(req, res) { res.redirect("/the-front"); });
        //the-front
        this.router.get(`/the-front`, this.explore);
        this.router.get(`/the-front/:frontDetail`, this.explore);
        //pages
        this.router.get(`/:page`, this.page);
        //explorer
        this.router.get(`/:region/:area/:poi`, this.lock, this.explore);
        this.router.get(`/:region/:area/:poi/:detail`, this.lock, this.explore);
        //void
        this.router.use(function(req, res) { 
            console.log(req.path);
            res.redirect("/void");
        });
    }

    lock = (req, res, next) => {
        req.lock = true;
        next();
    }

    explore = async (req, res, next) => {
        let main = `${req.contentPath}`;
        let siteTitle = `NotherBase - `;

        if (req.params.frontDetail) {
            main += `/the-front/${req.params.frontDetail}/index`;
            siteTitle += req.params.frontDetail;
        }
        else if (req.params.detail) {
            main += `/${req.params.region}/${req.params.area}/${req.params.poi}/${req.params.detail}/index`;
            siteTitle += req.params.detail;
        }
        else if (req.params.poi) {
            main += `/${req.params.region}/${req.params.area}/${req.params.poi}/index`;
            siteTitle += req.params.poi;
        }
        else {
            main += `/the-front/index`;
            siteTitle += "the-front";
        }

        try {
            if (fs.existsSync(main + ".ejs")) {
                let user = await req.db.User.recallOne(req.session.currentUser);

                let userStuff = {
                    userID: null,
                    user: null,
                };

                if (user) userStuff = {
                    userID: user.id,
                    user: user.memory.data,
                };

                let context = {
                    ...userStuff,
                    siteTitle: siteTitle,
                    main: main,
                    query: req.query,
                    dir: req.frontDir,
                    route: req.path,
                    requireUser: req.lock
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
        let main = `${req.contentPath}`;

        main += `/${req.params.page}/index.ejs`;

        try {
            if (fs.existsSync(main)) {
                let user = await req.db.User.recallOne(req.session.currentUser);

                let userStuff = {
                    userID: null,
                    user: null
                };

                if (user) userStuff = {
                    userID: user.id,
                    user: user.memory.data
                };

                let context = {
                    ...userStuff,
                    query: req.query,
                    dir: req.frontDir,
                    route: req.path
                }

                res.render(main, context);
            }
            else next();
        }
        catch(err) {
            console.log(err);
            res.status(500).end();
        }
    }
}