const path = require('path');
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
                                            localScripts: ["game", "items"],
                                            styles: ["items-floor"],
                                            serverScripts: ["game"],
                                            requiredItems: [
                                                "Gold Coin",
                                                "Rag Doll"
                                            ]
                                        }
                                    },
                                    {
                                        name: "nono-og",
                                        options: {
                                            localScripts: ["nono"],
                                            styles: ["nono"],
                                            requiredItems: [
                                                "Gold Coin"
                                            ]
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
                options: {
                    requiredItems: ["Gold Coin"]
                }
            }
        ]
    }
};

notherbase.start(world, path.resolve(__dirname, "pages"));