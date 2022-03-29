const notherbase = require("../index");

const world = {
    explorer: {
        name: "explorer",
        dirname: __dirname,
        options: {},
        void: "void",
        regions: [
            {
                name: "coast",
                dirname: __dirname,
                options: {},
                areas: [
                    {
                        name: "tall-beach",
                        dirname: __dirname,
                        options: {},
                        pois: [
                            {
                                name: "nono-cove",
                                dirname: __dirname,
                                options: {},
                                details: [
                                    {
                                        name: "",
                                        options: {
                                            localScripts: ["game"],
                                            serverScripts: ["game"]
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    theFront: {
        name: "the-front",
        dirname: __dirname,
        options: {},
        details: [
            {
                name: "",
                options: {}
            }
        ]
    }
};

notherbase.start(world);