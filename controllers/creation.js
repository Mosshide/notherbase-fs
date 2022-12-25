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
        this.router.get(`/:page`, this.explore);
        //explorer
        this.router.get(`/:region/:area/:poi`, this.explore);
        this.router.get(`/:region/:area/:poi/:detail`, this.explore);
        //void
        this.router.use(function(req, res) { res.redirect("/void"); });
    }

    explore = async (req, res, next) => {
        let reqUser = false;
        let main = `${req.contentPath}`;
        let siteTitle = `NotherBase - `;

        if (req.params.frontDetail) {
            main += `/the-front/${req.params.frontDetail}/index`;
            siteTitle += req.params.frontDetail;
        }
        else if (req.params.detail) {
            main += `/${req.params.region}/${req.params.area}/${req.params.poi}/${req.params.detail}/index`;
            siteTitle += req.params.detail;
            reqUser = true;
        }
        else if (req.params.poi) {
            main += `/${req.params.region}/${req.params.area}/${req.params.poi}/index`;
            siteTitle += req.params.poi;
            reqUser = true;
        }
        else if (req.params.page) {
            main += `/${req.params.page}/index`;
            siteTitle = req.params.page;
        }
        else {
            main += `/the-front/index`;
            siteTitle += "the-front";
        }

        try {
            if (fs.existsSync(main + ".ejs")) {
                let user = await req.db.User.recall(req.session.currentUser);

                let context = {
                    siteTitle: siteTitle,
                    userID: user._ID,
                    user: user.memory.data,
                    main: main,
                    query: req.query,
                    dir: req.frontDir,
                    route: req.path,
                    requireUser: reqUser
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
}