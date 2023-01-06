export default async (req, user) => {
    let gold = await req.db.Item.recallOne("Gold Coin");
    if (!gold) {
        //console.log(gold);
        await req.db.Item.create("Gold Coin", "Gold Coin", "Long Gold Coin");
    }

    await user.offsetItem("Gold Coin", 15);

    let local = await req.db.Spirit.recallOrCreate({
        route: req.body.route,
        scope: "local",
        parent: user.id,
        service: "gold"
    }, {}, {
        gold: 0
    });

    if (!local.memory.data.gold) local.memory.data.gold = 0;
    local.memory.data.gold += 15;
    await local.commit();

    let global = await req.db.Spirit.recallOrCreate({
        route: req.body.route,
        scope: "global",
        parent: null,
        service: "gold"
    }, {}, {
        gold: 0
    });

    if (!global.memory.data.gold) global.memory.data.gold = 0;
    global.memory.data.gold += 15;
    await global.commit();
}