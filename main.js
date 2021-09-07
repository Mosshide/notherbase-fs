const inventory = require(process.cwd() + "/models/inventory").inventory;

let router;
let dir;

let explore = function explore(route, styles = [], scripts = [], needsKey = "") {
    styles = styles.map(style => {
        style = `${dir}/styles/${style}`;
        return style;
    });

    scripts = scripts.map(script => {
        script = `${dir}/local-scripts/${script}`;
        return script;
    });

    let main = "index";
    if (route !== "") main = route;
    main = `${dir}/views/${main}`;

    router.get(`/${route}`, async function(req, res) {
        try {
            const foundInventory = await inventory.findOne({ user: req.session.currentUser }).populate("items.item");
        

            if (needsKey !== "" && foundInventory) {
                let hasKey = false;

                for (let i = 0; i < foundInventory.items.length; i++) {
                    if (foundInventory.items[i].item.name === hasKey) hasKey = true;
                }

                if (!hasKey) res.redirect("#destination-locked")
            }

            res.render(`explorer`, 
            {
                siteTitle: "NotherBase",
                user: null,
                styles: styles,
                main: main,
                scripts: scripts,
                pov: req.query.pov,
                inventory: foundInventory
            });
        }
        catch(err) {
            console.log(err);
        }
    });
}

let from = function from(currentDirectory) {
    dir = currentDirectory;
    router = require("express").Router();

    return {
        explore: explore,
        router: router
    };
}

module.exports = {
    from: from
}