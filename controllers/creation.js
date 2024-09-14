import express from "express";
import fs from 'fs';

/**
 * Creation is all the renedered pages in a base.
 */
export default class Creation {
    constructor(bases = {}) {
        this.bases = bases;
        this.router = express.Router();

        //home
        this.router.get("/", this.front, this.explore);

        //the-front
        this.router.get(`/the-front`, this.front, this.explore);
        this.router.get(`/the-front/:frontDetail`, this.frontDetail, this.explore);

        //pages
        this.router.get(`/:page`, this.page, this.explore);

        //the-front optional shortcuts
        this.router.get(`/:frontDetail`, this.frontDetail, this.explore);

        //explorer
        this.router.get(`/:region/:area/:poi`, this.lock, this.poi, this.explore);
        this.router.get(`/:region/:area/:poi/:detail`, this.lock, this.detail, this.explore);

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
            if (fs.existsSync(req.main + ".ejs")) {
                let stats = await req.db.Spirit.recallOrCreateOne("stats", null, { route: req.path });
                if (stats.memory.data.visits) stats.memory.data.visits++;
                else stats.memory.data.visits = 1;
                await stats.commit();

                let context = {
                    userID: null,
                    user: null,
                    siteTitle: req.siteTitle,
                    main: req.main,
                    query: req.query,
                    route: req.path,
                    requireUser: req.lock,
                    preprocessed: {}
                }

                if (req.session.currentUser) {
                    context.user = await req.db.Spirit.recallOne("user",  null, { username: req.session.currentUser });
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

    /**
     * This middleware directs exploration to the front.
     * @param {Object} req An Express.js request.
     * @param {Object} res An Express.js response.
     * @param {Function} next next()
     */
    front = async (req, res, next) => {
        req.main = req.contentPath + "/the-front/index";
        req.preprocess = req.contentPath + "/the-front/_preprocess";
        req.siteTitle = this.bases[req.hosting].title;
        req.toRender = "explorer";
        next();
    }

    /**
     * This middleware directs exploration to a detail in the front.
     * @param {Object} req An Express.js request.
     * @param {Object} res An Express.js response.
     * @param {Function} next next()
     */
    frontDetail = async (req, res, next) => {
        req.main = `${req.contentPath}/the-front/${req.params.frontDetail}/index`;
        req.preprocess = `${req.contentPath}/the-front/${req.params.frontDetail}/_preprocess`;
        req.siteTitle = `${this.bases[req.hosting].title} - ${req.params.frontDetail}`;
        req.toRender = "explorer";
        next();
    }

    /**
     * This middleware directs exploration to a point of interest.
     * @param {Object} req An Express.js request.
     * @param {Object} res An Express.js response.
     * @param {Function} next next()
     */
    poi = async (req, res, next) => {
        req.main = `${req.contentPath}/${req.params.region}/${req.params.area}/${req.params.poi}/index`;
        req.preprocess = `${req.contentPath}/${req.params.region}/${req.params.area}/${req.params.poi}/_preprocess`;
        req.siteTitle = `${this.bases[req.hosting].title} - ${req.params.poi}`;
        req.toRender = "explorer";
        next();
    }

    /**
     * This middleware directs exploration to a detail.
     * @param {Object} req An Express.js request.
     * @param {Object} res An Express.js response.
     * @param {Function} next next()
     */
    detail = async (req, res, next) => {
        req.main = `${req.contentPath}/${req.params.region}/${req.params.area}/${req.params.poi}/${req.params.detail}/index`;
        req.preprocess = `${req.contentPath}/${req.params.region}/${req.params.area}/${req.params.poi}/${req.params.detail}/_preprocess`;
        req.siteTitle = `${this.bases[req.hosting].title} - ${req.params.detail}`;
        req.toRender = "explorer";
        next();
    }

    /**
     * This middleware directs exploration to a one-off page.
     * @param {Object} req An Express.js request.
     * @param {Object} res An Express.js response.
     * @param {Function} next next()
     */
    page = async (req, res, next) => {
        req.main = `${req.contentPath}/pages/${req.params.page}/index`;
        req.preprocess = `${req.contentPath}/pages/${req.params.page}/_preprocess`;
        req.siteTitle = `${req.params.page}`;
        req.toRender = req.main;
        next();
    }
}