import express from "express";
let router = express.Router();

//the void
router.use(function(req, res){
    res.render(`explorer`, 
    {
        siteTitle: "NotherBase | The Void",
        user: null,
        inventory: null,
        main: `${req.voidDir}/index`,
        route: `/void`
    });
});

export default router;