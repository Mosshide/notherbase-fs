import express from "express";
const router = express.Router();
import fs from "fs";
import * as db from "../models/index.js";

export default function pages(path)
{
    let files = fs.readdirSync(path);

    router.post(`/serve/:script`, async function(req, res) {
        try {
            const foundUser = await db.user.findById(req.session.currentUser);

            let scriptResult = await require(`${path}/scripts/${req.params.script}.js`)(db, foundUser, req.body);
            res.send(scriptResult);
        }
        catch(err) {
            console.log(err);
            res.status(500).end();
        }
    });

    files.forEach(file => {
        file = file.slice(0, -4);

        router.get(`/${file}`, async function(req, res) {
            const foundUser = await db.user.findById(req.session.currentUser);

            res.render(`${path}/${file}.ejs`, {
                user: foundUser,
                query: req.query
            });
        });
    });

    return router;
}