const express = require("express");
const router = express.Router();

// Import my Data
const { inventory, item, connectionSuccess } = require("../models");

router.get("/", async function(req, res) {
    if (connectionSuccess) {
        try {
            if (req.session.currentUser) {
                let foundInventory = await inventory.findOne({user: req.session.currentUser}).populate("items.item");
    
                res.status(200).send({ foundInventory: foundInventory });
            }
            else {
                res.status(401).end();
            }
        }
        catch(err) {
            console.log(err);
            res.status(500).end();
        }
    }
    else {
        res.status(500).end();
    }
});

router.post("/", async function(req, res) {
    if (connectionSuccess) {
        try {
            if (req.body.item && req.body.amount) {
                if (req.session.currentUser) {
                    let foundInventory = await inventory.findOne({user: req.session.currentUser}).populate("items.item");
        
                    let holding = false;
        
                    for (let j = 0; j < foundInventory.items.length; j++) {
                        if (foundInventory.items[j].item._id.equals(req.body.item)) {
                            holding = true;
        
                            if (foundInventory.items[j].amount >= -Math.floor(req.body.amount)) {
                                foundInventory.items[j].amount += Math.floor(req.body.amount);
        
                                if (foundInventory.items[j].amount === 0) {
                                    let itemToEmpty = foundInventory.items[j].item._id;
        
                                    foundInventory.items.splice(j, 1);
                                    await foundInventory.save();
            
                                    res.status(200).send({
                                        item: itemToEmpty,
                                        amount: 0
                                    });
                                }
                                else {
                                    await foundInventory.save();
            
                                    res.status(200).send(foundInventory.items[j]);
                                }
                            }
                            else {
                                console.log("subtract from too few", req.change);
                                res.status(304).send(
                                    `Unable to remove ${req.body.amount} ${req.body.item} 
                                    from inventory because the inventory has only ${foundInventory.items[j].amount}.`
                                );
                            }
        
                            break;
                        }
                    }
                    
                    if (!holding) {
                        if (req.body.amount > 0) {
                            foundInventory.items.push({
                                item: req.body.item,
                                amount: req.body.amount
                            });
        
                            await foundInventory.save();
        
                            await inventory.populate(foundInventory, "items.item");
        
                            res.status(200).send(foundInventory.items[foundInventory.items.length - 1]);
                        }
                        else {
                            console.log("subtract from none", req.body);
                            res.status(304).send(
                                `Unable to remove ${req.body.amount} ${req.body.item} 
                                from inventory because the inventory has none.`
                            );
                        }
                    };
                }
                else {
                    res.status(401).send("User not logged in!");
                }
            }
            else {
                res.status(400).send("Check input!");
            }
        }
        catch(err) {
            res.status(500).end();
            console.log(err);
        }
    }
    else {
        res.status(500).end();
    }
});


module.exports = router;