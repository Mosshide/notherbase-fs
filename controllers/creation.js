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
        let route = "";
        let siteTitle = `NotherBase - `;

        if (req.params.frontDetail) {
            route = `/the-front/${req.params.frontDetail}/index`;
            siteTitle += req.params.frontDetail;
        }
        else if (req.params.detail) {
            route = `/${req.params.region}/${req.params.area}/${req.params.poi}/${req.params.detail}/index`;
            siteTitle += req.params.detail;
        }
        else if (req.params.poi) {
            route = `/${req.params.region}/${req.params.area}/${req.params.poi}/index`;
            siteTitle += req.params.poi;
        }
        else {
            route = `/the-front/index`;
            siteTitle += "the-front";
        }
        main += route;

        try {
            if (fs.existsSync(main + ".ejs")) {
                let user = await req.db.User.recallOne(req.session.currentUser);

                let stats = await req.db.Spirit.recallOne("stats");
                if (stats.memory.data[route]) {
                    stats.memory.data[route].visits++;
                }
                else {
                    stats.memory.data[route] = {
                        visits: 1
                    }
                }
                await stats.commit();

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
                    // dir: req.frontDir,
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

        main += `/pages/${req.params.page}/index.ejs`;

        try {
            if (fs.existsSync(main)) {
                let user = await req.db.User.recallOne(req.session.currentUser);

                let stats = await req.db.Spirit.recallOne("stats");
                if (stats.memory.data[main]) {
                    stats.memory.data[main].visits++;
                }
                else {
                    stats.memory.data[main] = {
                        visits: 1
                    }
                }
                await stats.commit();

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