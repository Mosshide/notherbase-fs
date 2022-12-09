import { success, check } from "./util.js";

export default {
    getAllItems: async (req) => {
        let items = new req.db.Item();
        let all = items.getAll();

        check(itemData, "Items not found.");

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
    deleteItem: async (req) => {
        let item = new req.db.Item(req.body.data.name);
        item.delete();

        return success("Item deleted.");
    }
}