import express from "express";
import fs from 'fs';
import { fileURLToPath } from 'node:url';
const __dirname = fileURLToPath(new URL('./', import.meta.url));
import subdomain from 'express-subdomain';
import favicon from 'serve-favicon';
import session from 'express-session';
import MongoStore from 'connect-mongo';

/**
 * Creation is all the renedered pages in a base.
 */
export default class Creation {
    constructor(bases = {}) {
        this.bases = bases;
        this.router = express.Router();

        this.router.use((req, res, next) => {
            req.hosting = req.hostname.split(".")[0];
            console.log(req.hosting);
            req.contentPath = this.bases[req.hosting].directory;
            next();
        });

        this.router.use((req, res) => {
            console.log(req.contentPath);
            
            return express.static(`${req.contentPath}/public`);
        });

        this.router.use((req, res) => {
            console.log(this.bases[req.hosting].favicon);
            return favicon(req.contentPath + this.bases[req.hosting].favicon);
        });

        //enable cookies
        this.router.use((req, res) => {
            console.log(req.hosting);
            
            return session({
                store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
                secret: process.env.SECRET,
                name: req.hosting + '-session-id',
                resave: false,
                saveUninitialized: false,
                cookie: { 
                    secure: process.env.PRODUCTION == "true",
                    maxAge: 1000 * 60 * 60 * 24 * 28 // 28 days 
                } 
            })
        });

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
                    requireUser: req.lock
                }

                if (req.session.currentUser) {
                    context.user = await req.db.Spirit.recallOne("user",  null, { username: req.session.currentUser });
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
        req.siteTitle = this.siteTitle;
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
        req.siteTitle = `${this.siteTitle} - ${req.params.frontDetail}`;
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
        req.siteTitle = `${this.siteTitle} - ${req.params.poi}`;
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
        req.siteTitle = `${this.siteTitle} - ${req.params.detail}`;
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
        req.siteTitle = `${req.params.page}`;
        req.toRender = req.main;
        next();
    }
}