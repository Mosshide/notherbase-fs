import express from "express";
import fs from 'fs';

/**
 * Creation is all the renedered pages in a base.
 */
export default class Creation {
    constructor(bases = {}) {
        this.bases = bases;
        this.router = express.Router();

        this.router.get("/", this.explore);
        this.router.get("/the-front", this.explore);
        this.router.get(`/:region`, this.lock, this.explore);
        this.router.get(`/:region/:area`, this.lock, this.explore);
        this.router.get(`/:region/:area/:poi`, this.lock, this.explore);
        this.router.get(`/:region/:area/:poi/:detail`, this.lock, this.explore);

        //void
        this.router.use(function(req, res) {
            res.redirect("/void");
        });
    }

    /**
     * This middleware requires a user to login to access affected routes.
     * @param {Object} req An Express.js request.
     * @param {Object} res An Express.js response.
     * @param {Function} next next()
     */
    lock = (req, res, next) => {
        req.lock = true;
        next();
    }

    /**
     * This route renders a page and sends it to the client.
     * @param {Object} req An Express.js request.
     * @param {Object} res An Express.js response.
     * @param {Function} next next()
     */
    explore = async (req, res, next) => {
        try {
            req.main = `index`;
            if (req.params.detail) req.main = req.params.detail + "\\" + req.main;
            if (req.params.poi) req.main = req.params.poi + "\\" + req.main;
            if (req.params.area) req.main = req.params.area + "\\" + req.main;
            if (req.params.region) req.main = req.params.region + "\\" + req.main;
            else req.main = "the-front\\" + req.main;
            req.main = req.contentPath + "\\" + req.main;
            req.preprocess = "_preprocess";
            if (req.params.detail) req.preprocess = req.params.detail + "\\" + req.preprocess;
            if (req.params.poi) req.preprocess = req.params.poi + "\\" + req.preprocess;
            if (req.params.area) req.preprocess = req.params.area + "\\" + req.preprocess;
            if (req.params.region) req.preprocess = req.params.region + "\\" + req.preprocess;
            else req.preprocess = "the-front\\" + req.preprocess;
            req.preprocess = req.contentPath + "\\" + req.preprocess;
            req.siteTitle = `${this.bases[req.hosting].title} - ${req.params.detail || req.params.poi || req.params.area || req.params.region || "Home"}`;
            req.toRender = "explorer";
            
            if (fs.existsSync(req.main + ".ejs")) {
                let stats = await req.Spirit.findOne({ service: "stats", data: { route: req.path } });
                if (stats == null) stats = new req.Spirit({ service: "stats", data: { route: req.path, visits: 0 } });
                if (stats.data.visits) stats.data.visits++;
                else stats.data.visits = 1;
                await stats.commit();

                let context = {
                    user: null,
                    siteTitle: req.siteTitle,
                    main: req.main,
                    query: req.query,
                    route: req.path,
                    requireUser: req.lock,
                    preprocessed: {}
                }

                if (req.session.currentUser) {
                    let user = req.user;
                    context.user = {
                        data: user.data,
                        backups: user.backups,
                        _id: user._id,
                        parent: user.parent,
                        service: user.service,
                        _lastUpdate: user._lastUpdate
                    }
                }      

                //preprocess
                let preprocessScripts = fs.existsSync(req.preprocess) ? fs.readdirSync(req.preprocess) : [];
                for (let preprocessScript of preprocessScripts) {
                    try {
                        let scriptPath = `${req.preprocess}/${preprocessScript}`;

                        if (fs.existsSync(scriptPath)) {
                            let script = await import(process.env.WINDOWS == "true" ? `file://${scriptPath}` : scriptPath);
                            let result = await script.default(req, context.user, this.io);
                            context.preprocessed[preprocessScript.split(".")[0]] = result;
                        }
                        else context.preprocessed[preprocessScript.split(".")[0]] = `Error: Script Not Found`;
                    } catch (error) {
                        console.log(error);
                        context.preprocessed[preprocessScript.split(".")[0]] = `Error: Server Error`;
                    }
                }

                res.render(req.toRender, context);
            }
            else next();
        }
        catch(err) {
            console.log(err);
            res.status(500).send("Server Error");
        }
    }
}