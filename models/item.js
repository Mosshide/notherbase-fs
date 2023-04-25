import Spirit from "./spirit.js";

export default class Item extends Spirit {
    static create = async (name, short, long) => {
        let spirit = new Item(name);

        spirit.memory = await Spirit.db.create({
            service: "items",
            parent: null,
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
            service: "items",
            parent: null
        });

        if (found) {
            spirit.memory = found;
            
            return spirit;
        }
        else return null;
    }

    static recallOne = async (name) => {
        let spirit = new Item(name);

        let query = Spirit.buildQuery("items", { name });

        let found = await Spirit.db.findOne(query);

        if (found) {
            spirit.memory = found;
            
            return spirit;
        }
        else return null;
    }

    static delete = async (name) => {
        let found = await Spirit.db.findAndDelete(Spirit.buildQuery("items", { name }));

        return found.deletedCount;
    }

    constructor(name = "") {
        super();
        this.name = name;
    }
}