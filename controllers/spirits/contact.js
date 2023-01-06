import express from "express";
import { success } from "./util.js";

export default class Contact {
    constructor() {
        this.router = express.Router();

        this.router.post(`/`, this.contactNother);
    }

    contactNother = async function(req, res) {
        let user = await User.recallOne(req.session.currentUser);

        let spirit = await req.db.Spirit.create({
            route: "/",
            service: "nother-contacts",
            scope: "local",
            parent: user.id
        }, req.body);

        success(res, "Message sent.");
    }
}