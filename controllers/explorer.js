const inventory = require("../models/inventory");

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

                    detail.options = {
                        styles: [],
                        externalStyles: [],
                        scripts: [],
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
                
                    detail.options.scripts = detail.options.scripts.map(script => {
                        script = `${currentDir}/local-scripts/${script}`;
                        return script;
                    });
                
                    detail.options.main = "index";
                    if (detail.name !== "") detail.options.main = detail.name;
                    detail.options.main = `${currentDir}/views/${detail.options.main}`;
                
                    router.get(`/${currentRegion}/${currentArea}/${currentPoi}/${detail.name}`, async function(req, res) {
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
                                    siteTitle: "NotherBase",
                                    user: req.session.currentUserFull,
                                    styles: detail.options.styles,
                                    externalStyles: detail.options.externalStyles,
                                    main: detail.options.main,
                                    scripts: detail.options.scripts,
                                    pov: req.query.pov,
                                    inventory: foundInventory,
                                    query: req.query
                                });
                            }
                            else res.render(`explorer`, 
                            {
                                siteTitle: "NotherBase",
                                user: req.session.currentUserFull,
                                styles: detail.options.styles,
                                externalStyles: detail.options.externalStyles,
                                main: detail.options.main,
                                scripts: detail.options.scripts,
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
            }
        }
    }


    //the void
    router.use(function(req, res, next){
        res.render(`explorer`, 
        {
            siteTitle: "NotherBase | The Void",
            user: null,
            styles: [`${dir}/${explorerBuild.void}/styles/void`],
            externalStyles: [],
            scripts: [],
            inventory: null,
            main: `${dir}/${explorerBuild.void}/index`
        });
    });

    // start location
    router.get("/", function(req, res) {
        res.redirect("/the-front");
    });
}

module.exports = {
    router: router,
    complete: complete
}