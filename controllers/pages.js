import express from "express";
const router = express.Router();
import fs from "fs";

router.post(`/serve/:script`, async function(req, res) {
    try {
        const foundUser = await req.db.user.findById(req.session.currentUser);

        let scriptResult = await require(`${req.pagesDir}/scripts/${req.params.script}.js`)(db, foundUser, req.body);
        res.send(scriptResult);
    }
    catch(err) {
        console.log(err);
        res.status(500).end();
    }
});

router.get(`/:page`, async function(req, res, next) {
    fs.access(`${req.pagesDir}/${req.params.page}.ejs`, async (err) => {
        if (!err) {
            const foundUser = await req.db.user.findById(req.session.currentUser);
    
            res.render(`${req.pagesDir}/${req.params.page}.ejs`, {
                user: foundUser,
                query: req.query
            });
        }
        else {
            console.log(err);
            next();
        }
    });
});

export default router;