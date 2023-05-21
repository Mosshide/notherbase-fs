import express from "express";
import fs from 'fs';

export default class Creation {
    constructor() {
        this.router = express.Router();

        //home
        this.router.get("/", function(req, res) { res.redirect("/the-front"); });
        //the-front
        this.router.get(`/the-front`, this.front, this.explore);
        this.router.get(`/the-front/:frontDetail`, this.frontDetail, this.explore);
        //pages
        this.router.get(`/:page`, this.page, this.explore);
        //explorer
        this.router.get(`/:region/:area/:poi`, this.lock, this.poi, this.explore);
        this.router.get(`/:region/:area/:poi/:detail`, this.lock, this.detail, this.explore);
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
        try {
            if (fs.existsSync(req.main + ".ejs")) {
                let stats = await req.db.Spirit.recallOne("stats");
                if (stats.memory.data[req.path]) stats.memory.data[req.path].visits++;
                else stats.memory.data[req.path] = { visits: 1 };
                await stats.commit();

                let context = {
                    userID: null,
                    user: null,
                    siteTitle: req.siteTitle,
                    main: req.main,
                    query: req.query,
                    route: req.path,
                    requireUser: req.lock
                }

                let user = await req.db.User.recallOne(req.session.currentUser);
                if (user) {
                    context.userID = user.id;
                    context.user = user.memory.data;
                };

                res.render(req.toRender, context);
            }
            else next();
        }
        catch(err) {
            console.log(err);
            res.status(500).end();
        }
    }

    front = async (req, res, next) => {
        req.main = req.contentPath + "/the-front/index";
        req.siteTitle = "NotherBase - The Front";
        req.toRender = "explorer";
        next();
    }

    frontDetail = async (req, res, next) => {
        req.main = `${req.contentPath}/the-front/${req.params.frontDetail}/index`;
        req.siteTitle = `NotherBase - ${req.params.frontDetail}`;
        req.toRender = "explorer";
        next();
    }

    poi = async (req, res, next) => {
        req.main = `${req.contentPath}/${req.params.region}/${req.params.area}/${req.params.poi}/index`;
        req.siteTitle = `NotherBase - ${req.params.poi}`;
        req.toRender = "explorer";
        next();
    }

    detail = async (req, res, next) => {
        req.main = `${req.contentPath}/${req.params.region}/${req.params.area}/${req.params.poi}/${req.params.detail}/index`;
        req.siteTitle = `NotherBase - ${req.params.detail}`;
        req.toRender = "explorer";
        next();
    }

    page = async (req, res, next) => {
        req.main = `${req.contentPath}/pages/${req.params.page}/index`;
        req.siteTitle = `${req.params.page}`;
        req.toRender = req.main;
        next();
    }
}