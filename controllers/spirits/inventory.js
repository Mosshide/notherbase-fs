import { success, check, loginCheck, findUser } from "./util.js";

export default {
    getUserInventory: async (req) => {
        loginCheck(req);
        let user = await findUser(req);
        let inv = user.memory.data.inventory;

        check(inv, "User inventory not found.");
    
        return success("User inventory found.", inv);
    },
    updateItemInInventory: async (req) => {
        check(req.body.data.name && req.body.data.amount, `${req.body.data.name} ${req.body.data.amount} Check Input!`);

        let item = new req.db.Item(req.body.data.name);
        let itemData = await item.recall();

        check(itemData, "Item not found in database.");

        let user = await findUser(req);
        let inv = user.memory.data.inventory;

        let holding = false;

        for (let j = 0; j < inv.length; j++) {
            if (inv[j].name === req.body.data.name) {
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
                    return fail(`Unable to remove ${req.body.data.amount} ${req.body.data.name} 
                        from inventory because the inventory has only ${inv[j].amount}.` );
                }
            }
        }
        
        if (!holding) {
            if (req.body.data.amount > 0) {
                inv.push({
                    name: req.body.data.name,
                    amount: req.body.data.amount
                });

                await user.commit();

                return success("Item offset.", inv[inv.length - 1]);
            }
            else {
                return fail(`Unable to remove ${req.body.data.amount} ${req.body.data.name} 
                    from inventory because the inventory has none.`);
            }
        };
    }
}