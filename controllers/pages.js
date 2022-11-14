const express = require("express");
const router = express.Router();
const fs = require('fs');

const db = require("../models");

module.exports = function name(path)
{
    let files = fs.readdirSync(path);

    router.post(`/serve/:script`, async function(req, res) {
        try {
            let scriptResult = await require(`${path}/scripts/${req.params.script}.js`)(db, req.session.currentUser, req.body);
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