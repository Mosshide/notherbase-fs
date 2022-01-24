const inventory = require("../models/inventory");

let router = require("express").Router();
let dir = "";

let front = function front(detail) {
    detail.options = {
        styles: [],
        externalStyles: [],
        scripts: [],
        needsKey: "",
        dropOff: "",
        ...detail.options
    };

    detail.options.styles = detail.options.styles.map(style => {
        style = `${dir}/styles/${style}`;
        return style;
    });

    detail.options.externalStyles = detail.options.externalStyles.map(style => {
        style = `${dir}/${style}`;
        return style;
    });

    detail.options.scripts = detail.options.scripts.map(script => {
        script = `${dir}/local-scripts/${script}`;
        return script;
    });

    detail.options.main = "index";
    if (detail.name !== "") detail.options.main = detail.name;
    detail.options.main = `${dir}/views/${detail.options.main}`;

    router.get(`/${detail.name}`, async function(req, res) {
        try {
            const foundInventory = await inventory.findOne({ user: req.session.currentUser }).populate("items.item");
        
            if (detail.options.needsKey !== "" && foundInventory) {
                let hasKey = false;

                for (let i = 0; i < foundInventory.items.length; i++) {
                    if (foundInventory.items[i].item.name === detail.options.needsKey) hasKey = true;
                }

                if (!hasKey) res.redirect(detail.options.dropOff);
                else res.render(`explorer`, 
                {
                    siteTitle: "NotherBase | The Front",
                    user: req.session.currentUserFull,
                    styles: detail.options.styles,
                    externalStyles: detail.options.externalStyles,
                    main: detail.options.main,
                    scripts: detail.options.scripts,
                    query: req.query
                });
            }
            else res.render(`explorer`, 
            {
                siteTitle: "NotherBase | The Front",
                user: req.session.currentUserFull,
                styles: detail.options.styles,
                externalStyles: detail.options.externalStyles,
                main: detail.options.main,
                scripts: detail.options.scripts,
                query: req.query
            });
        }
        catch(err) {
            console.log(err);
        }
    });
}

let complete = function complete(frontBuild) {
    dir = frontBuild.dirname;

    for (let i = 0; i < frontBuild.details.length; i++) {
        front(frontBuild.details[i]);
    }
}

module.exports = {
    setDir: function setDir(newDir) {
        dir = newDir;
    },
    router: router,
    front: front,
    complete: complete
}