import { success, check, loginCheck, findUser } from "./util.js";

export default {
    getUserInventory: async (req) => {
        loginCheck(req);

        let user = findUser(req);
        let inv = user.memory.data.inventory;

        check(inv, "User inventory not found.");
    
        return success("User inventory found.", inv);
    },
    updateItemInInventory: async (req) => {
        check(req.body.data.item && req.body.data.amount, `${req.body.item} ${req.body.amount} Check Input!`);

        let item = new req.db.Item(req.body.data.item);
        let itemData = (await item.recall()).data;

        check(itemData, "Item not found in database.");

        let user = findUser(req);
        let inv = user.memory.data.inventory;

        let holding = false;

        for (let j = 0; j < inv.length; j++) {
            if (inv[j].item === req.body.data.item) {
                holding = true;

                if (inv[j].amount >= -Math.floor(req.body.data.amount)) {
                    inv[j].amount += Math.floor(req.body.data.amount);

                    if (inv[j].amount === 0) {
                        let empty = inv[j];

                        inv.splice(j, 1);
                        await user.commit();

                        return success("Item emptied.", empty);
                    }
                    else {
                        await user.commit();

                        return success("Item offset.", inv[j]);
                    }
                }
                else {
                    return fail(`Unable to remove ${req.body.data.amount} ${req.body.data.item} 
                        from inventory because the inventory has only ${inv[j].amount}.` );
                }
            }
        }
        
        if (!holding) {
            if (req.body.data.amount > 0) {
                inv.push({
                    item: req.body.data.item,
                    amount: req.body.data.amount
                });

                await user.commit();

                return success("Item offset.", inv[inv.length - 1]);
            }
            else {
                return fail(`Unable to remove ${req.body.amount} ${req.body.item} 
                    from inventory because the inventory has none.`);
            }
        };
    }
}