import { success, check } from "./util.js";

class Item extends Spirit {
    constructor(name = "") {
        super();
        this.body.route = "/";
        this.body.service = "item";

        this.memory = {
            data: {
                name: name
            }
        }
    }

    recall = async () => {
        let result = await this.recallFromData("name", this.memory.data.name);
        return result;
    }
    
    commit = async (data = this.memory.data) => {
        let result = await this.commitByData("name", this.memory.data.name, data);
        return result;
    }

    delete = async () => {
        let result = await this.deleteByData("name", this.memory.data.name);
        return result;
    }
}

export default {
    getAllItems: async (req) => {
        let items = new req.db.Item();
        let all = await items.getAll();

        check(all, "Items not found.");

        return success("Found items.", all);
    },
    getItem: async (req) => {
        let item = new req.db.Item(req.body.data.name);

        let itemData = await item.recall();

        check(itemData, `Item not found: ${req.body.data.name}`);

        return success("Found item.", itemData);
    },
    setItem: async (req) => {
        let item = new req.db.Item(req.body.data.name);

        await item.commit(req.body.data);

        return success();
    },
    newItem: async (req) => {
        let item = new req.db.Item(req.body.data.name);

        await item.create(req.body.data);

        return success();
    },
    deleteItem: async (req) => {
        let item = new req.db.Item(req.body.data.name);
        item.delete();

        return success("Item deleted.");
    }
}