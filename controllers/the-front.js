const { user, inventory, connectionSuccess } = require("../models");
const path = require('path');

let router = require("express").Router();
let dir = "";


let front = function front(detail) {
    detail.options = {
        styles: [],
        externalStyles: [],
        localScripts: [],
        requiredItems: [],
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

    router.get(`/${detail.name}`, async function(req, res) {
        detail.options.main = "index";
        if (detail.name !== "") detail.options.main = detail.name;
        detail.options.main = `${dir}/views/${detail.options.main}`;

        let foundItemIDs = [];
        for (let m = 0; m < detail.options.requiredItems.length; m++) {
            let foundItem = await item.findOne({name: detail.options.requiredItems[m]});

            foundItemIDs.push(foundItem._id);
        }

        let context = {
            siteTitle: "NotherBase | The Front",
            user: null,
            styles: detail.options.styles,
            externalStyles: detail.options.externalStyles,
            main: detail.options.main,
            localScripts: detail.options.localScripts,
            itemIDs: foundItemIDs,
            inventory: null,
            query: req.query,
            dir: dir,
            path: path
        }

        if (connectionSuccess) {
            try {
                context.user = await user.findById(req.session.currentUser);
                context.inventory = await inventory.findOne({ user: req.session.currentUser }).populate("items.item");
            
                if (detail.options.needsKey !== "" && context.inventory) {
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