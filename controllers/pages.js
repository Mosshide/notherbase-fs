import express from "express";
const router = express.Router();
import fs from "fs";

router.post(`/serve/:script`, async function(req, res) {
    try {
        const foundUser = await req.db.user.findById(req.session.currentUser);

        let script = await import(`${req.pagesDir}/scripts/${req.params.script}.js`);
        let scriptResult = await script.default(req.db, foundUser, req.body);
        res.send(scriptResult);
    }
    catch(err) {
        console.log(err);
        res.status(500).end();
    }
});

router.get(`/:page`, async function(req, res, next) {
    if (fs.existsSync(`${req.pagesDir}/${req.params.page}.ejs`)) {
        const foundUser = await req.db.user.findById(req.session.currentUser);

        res.render(`${req.pagesDir}/${req.params.page}.ejs`, {
            user: foundUser,
            query: req.query
        });
    } 
    else {
        next();
    }
});

export default router;