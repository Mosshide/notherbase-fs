const express = require("express");
const router = express.Router();
const fs = require('fs');

module.exports = function name(path)
{
    let files = fs.readdirSync(path);

    files.forEach(file => {
        file = file.slice(0, -4);
        console.log(file);

        router.get(`/${file}`, function(req, res) {
            res.render(`${path}/${file}.ejs`);
        });
    });

    return router;
}