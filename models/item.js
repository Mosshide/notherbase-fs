import Spirit from "./spirit.js";

export default class Item extends Spirit {
    static create = async (name, short, long) => {
        let spirit = new Item(name);

        spirit.memory = await Spirit.db.create({
            route: "/",
            service: "items",
            parent: null,
            scope: "global",
            _lastUpdate: Date.now(),
            data: {
                name,
                short,
                long
            }
        });

        return spirit;
    }

    static recallAll = async () => {
        let spirit = new Item();

        let found = await Spirit.db.find({
            route: "/",
            service: "items",
            parent: null,
            scope: "global"
        });

        if (found) {
            spirit.memory = found;
            
            return spirit;
        }
        else return null;
    }

    static recallOne = async (name) => {
        let spirit = new Item(name);

        let query = Spirit.buildQuery({
            route: "/",
            service: "items",
            parent: null,
            scope: "global"
        }, {
            name: name
        });

        let found = await Spirit.db.findOne(query);

        if (found) {
            spirit.memory = found;
            
            return spirit;
        }
        else return null;
    }

    static delete = async (name) => {
        let found = await Spirit.db.findAndDelete(Spirit.buildQuery({
            route: "/",
            service: "items",
            parent: null,
            scope: "global"
        }, {
            name: name
        }));

        return found.deletedCount;
    }

    constructor(name = "") {
        super();
        this.name = name;
    }
}