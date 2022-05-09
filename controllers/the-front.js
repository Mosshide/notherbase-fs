const { inventory, connectionSuccess } = require("../models");

let router = require("express").Router();
let dir = "";


let front = function front(detail) {
    detail.options = {
        styles: [],
        externalStyles: [],
        localScripts: [],
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

    detail.options.localScripts = detail.options.localScripts.map(script => {
        script = `${dir}/local-scripts/${script}`;
        return script;
    });

    detail.options.main = "index";
    if (detail.name !== "") detail.options.main = detail.name;
    detail.options.main = `${dir}/views/${detail.options.main}`;

    router.get(`/${detail.name}`, async function(req, res) {
        let context = {
            siteTitle: "NotherBase | The Front",
            user: null,
            styles: detail.options.styles,
            externalStyles: detail.options.externalStyles,
            main: detail.options.main,
            localScripts: detail.options.localScripts,
            inventory: null,
            query: req.query
        }

        if (connectionSuccess) {
            context.user = req.session.currentUserFull;

            try {
                const foundInventory = await inventory.findOne({ user: req.session.currentUser }).populate("items.item");
                context.inventory = foundInventory;
            
                if (detail.options.needsKey !== "" && foundInventory) {
                    let hasKey = false;
    
                    for (let i = 0; i < foundInventory.items.length; i++) {
                        if (foundInventory.items[i].item.name === detail.options.needsKey) hasKey = true;
                    }
    
                    if (!hasKey) res.redirect(detail.options.dropOff);
                    else res.render(`explorer`, context);
                }
                else res.render(`explorer`, context);
            }
            catch(err) {
                console.log(err);
            }
        }
        else {
            console.log("no db connection");

            res.render(`explorer`, context);
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