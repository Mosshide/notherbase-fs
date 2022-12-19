import Spirit from "./spirit.js";

export default class Item extends Spirit {
    static recall = async (name) => {
        return await super.recall({
            route: "/",
            service: "item",
            scope: "global",
            parent: null
        }, { name: name });
    }

    static delete = async (name) => {
        return await super.recall({
            route: "/",
            service: "item",
            scope: "global",
            parent: null
        }, { name: name });
    }

    constructor(name = "") {
        super();
        this.name = name;
    }
}