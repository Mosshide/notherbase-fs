const { inventory, game, item, user } = require("../models");
const path = require('path');

let router = require("express").Router();;
let dir = "";

let complete = function complete(explorerBuild) {
    dir = explorerBuild.dirname;

    let currentRegion, currentArea, currentPoi = "";

    for (let i = 0; i < explorerBuild.regions.length; i++) {
        let region = explorerBuild.regions[i];
        currentRegion = region.name;

        for (let j = 0; j < region.areas.length; j++) {
            let area = region.areas[j];
            currentArea = area.name;

            for (let k = 0; k < area.pois.length; k++) {
                let poi = area.pois[k];
                currentPoi = poi.name;

                for (let l = 0; l < poi.details.length; l++) {
                    let detail = poi.details[l];

                    let currentDir = `${dir}/${currentRegion}/${currentArea}/${currentPoi}`;
                    let currentRoute = `/${currentRegion}/${currentArea}/${currentPoi}/${detail.name}`;

                    detail.options = {
                        styles: [],
                        externalStyles: [],
                        localScripts: [],
                        serverScripts: [],
                        requiredItems: [],
                        needsKey: "",
                        dropOff: "",
                        ...detail.options
                    };
                
                    detail.options.styles = detail.options.styles.map(style => {
                        style = `${currentDir}/styles/${style}`;
                        return style;
                    });
                
                    detail.options.externalStyles = detail.options.externalStyles.map(style => {
                        style = `${currentDir}/${style}`;
                        return style;
                    });
                
                    detail.options.localScripts = detail.options.localScripts.map(script => {
                        script = `${currentDir}/local-scripts/${script}`;
                        return script;
                    });

                    detail.options.serverScripts = detail.options.serverScripts.map(script => {
                        script = require(`${currentDir}/server-scripts/${script}`);
                        return script;
                    });
                
                    detail.options.main = "index";
                    if (detail.name !== "") detail.options.main = detail.name;
                    detail.options.main = `${currentDir}/views/${detail.options.main}`;
                
                    router.get(currentRoute, async function(req, res) {
                        try {
                            const foundUser = await user.findById(req.session.currentUser);
                            const foundInventory = await inventory.findOne({ user: req.session.currentUser }).populate("items.item");
                        
                            let serverScriptReturns = [];

                            for (let m = 0; m < detail.options.serverScripts.length; m++) {
                                serverScriptReturns.push(await detail.options.serverScripts[m]({
                                    game: game,
                                    inventory: inventory,
                                    item: item
                                }));
                            }

                            let foundItemIDs = [];
                            for (let m = 0; m < detail.options.requiredItems.length; m++) {
                                let foundItem = await item.findOne({name: detail.options.requiredItems[m]});

                                foundItemIDs.push(foundItem._id);
                            }

                            let context = {
                                siteTitle: "NotherBase",
                                user: foundUser,
                                styles: detail.options.styles,
                                externalStyles: detail.options.externalStyles,
                                main: detail.options.main,
                                localScripts: detail.options.localScripts,
                                serverScriptReturns: serverScriptReturns,
                                itemIDs: foundItemIDs,
                                pov: req.query.pov,
                                inventory: foundInventory,
                                query: req.query,
                                dir: dir,
                                path: path
                            }

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
                    });
                }
            }
        }
    }

    // start location
    router.get("/", function(req, res) {
        res.redirect("/the-front");
    });

    //the void
    router.use(function(req, res, next){
        res.render(`explorer`, 
        {
            siteTitle: "NotherBase | The Void",
            user: null,
            styles: [`${dir}/${explorerBuild.void}/styles/void`],
            externalStyles: [],
            localScripts: [],
            inventory: null,
            itemIDs: [],
            main: `${dir}/${explorerBuild.void}/index`,
            dir: dir,
            path: path
        });
    });
}

module.exports = {
    router: router,
    complete: complete
}