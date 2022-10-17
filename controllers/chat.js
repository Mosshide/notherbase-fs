const express = require("express");
const router = express.Router();

const getRouterWithIO = function getRouterWithIO(io) {
    router.post("/", async function(req, res) {
        try {
            if (req.session.currentUser) {
                io.to(req.body.room).emit('chat message', {
                    name: req.session.currentUser,
                    time: Date.now(),
                    text: req.body.text
                });

                res.status(200).end();
            }
            else {
                res.status(401).end();
            }
        }
        catch(err) {
            console.log(err);
        }
    });

    return router;
}

module.exports = getRouterWithIO;