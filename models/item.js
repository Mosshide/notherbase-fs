import Spirit from "./spirit.js";

export default class Item extends Spirit {
    /**
     * Creates an item in the database.
     * @param {String} name The item name.
     * @param {String} short A short descrption.
     * @param {String} long A long description.
     * @returns The item created.
     */
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

    /**
     * Recalls all items.
     * @returns The items found or null.
     */
    static recallAll = async () => {
        let items = new Item();

        let found = await Spirit.db.find({
            service: "items",
            parent: null
        });

        if (found) {
            items.memory = found;
            
            return items;
        }
        else return null;
    }

    /**
     * Recalls one item by name.
     * @param {String} name The item name.
     * @returns The item found or null.
     */
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

    /**
     * Deletes items by name.
     * @param {String} name The item name.
     * @returns Number of documents deleted.
     */
    static delete = async (name) => {
        let found = await Spirit.db.findAndDelete(Spirit.buildQuery("items", { name }));

        return found.deletedCount;
    }

    constructor(name = "") {
        super();
        this.name = name;
    }
}