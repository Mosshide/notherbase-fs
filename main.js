const inventory = require(process.cwd() + "/models/inventory").inventory;

let router;
let dir;

let explore = function explore(route, options) {
    options = {
        styles: [],
        externalStyles: [],
        scripts: [],
        needsKey: "",
        dropOff: "",
        ...options
    };

    options.styles = options.styles.map(style => {
        style = `${dir}/styles/${style}`;
        return style;
    });

    options.scripts = options.scripts.map(script => {
        script = `${dir}/local-scripts/${script}`;
        return script;
    });

    options.main = "index";
    if (route !== "") options.main = route;
    options.main = `${dir}/views/${options.main}`;

    router.get(`/${route}`, async function(req, res) {
        try {
            const foundInventory = await inventory.findOne({ user: req.session.currentUser }).populate("items.item");
        
            if (options.needsKey !== "" && foundInventory) {
                let hasKey = false;

                for (let i = 0; i < foundInventory.items.length; i++) {
                    if (foundInventory.items[i].item.name === options.needsKey) hasKey = true;
                }

                if (!hasKey) res.redirect(options.dropOff);
                else res.render(`explorer`, 
                {
                    siteTitle: "NotherBase",
                    user: req.session.currentUserFull,
                    styles: options.styles,
                    externalStyles: options.externalStyles,
                    main: options.main,
                    scripts: options.scripts,
                    pov: req.query.pov,
                    inventory: foundInventory,
                    query: req.query
                });
            }
            else res.render(`explorer`, 
            {
                siteTitle: "NotherBase",
                user: req.session.currentUserFull,
                styles: options.styles,
                externalStyles: options.externalStyles,
                main: options.main,
                scripts: options.scripts,
                pov: req.query.pov,
                inventory: foundInventory,
                query: req.query
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