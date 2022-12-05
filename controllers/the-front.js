import express from "express";

const front = function front(dir) {
    let router = express.Router();
    
    router.post(`/serve/:script`, async function(req, res) {
        try {  
            let scriptResult = await require(`${worldPath}/${currentRoute}/server-scripts/${req.params.script}.js`)(db, "/the-front", req.session.currentUser, req.body);
            res.send(scriptResult);
        }
        catch(err) {
            console.log(err);
            res.status(500).end();
        }
    });
    
    router.get(`/:detail`, async function(req, res) {
        try {
            const foundUser = await req.db.user.findById(req.session.currentUser);
            const foundInventory = await req.db.inventory.findOne({ user: req.session.currentUser }).populate("items.item");
    
            let main = `${dir}/views/${req.params.detail}`;
    
            let context = {
                siteTitle: `NotherBase - ${req.params.detail}`,
                user: foundUser,
                main: main,
                inventory: foundInventory,
                query: req.query,
                dir: dir,
                route: `/the-front/${req.params.detail}`
            }
    
            await res.render(`explorer`, context);
        }
        catch(err) {
            console.log(err);
            res.status(500).end();
        }
    });
    
    router.get(`/`, async function(req, res) {
        try {
            const foundUser = await req.db.user.findById(req.session.currentUser);
            const foundInventory = await req.db.inventory.findOne({ user: req.session.currentUser }).populate("items.item");
    
            let main = `${dir}/views/index`;
    
            let context = {
                siteTitle: `NotherBase - The Front`,
                user: foundUser,
                main: main,
                inventory: foundInventory,
                query: req.query,
                dir: dir,
                route: `/the-front`
            }
    
            await res.render(`explorer`, context);
        }
        catch(err) {
            console.log(err);
            res.status(500).end();
        }
    });
    
    return router;
}

export default front;