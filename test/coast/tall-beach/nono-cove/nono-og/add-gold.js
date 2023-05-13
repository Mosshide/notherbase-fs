export default async (req, user) => {
    await user.offsetItem("Gold Coin", 3);

    let spirit = await req.db.Spirit.recallOne("test");
    if (!spirit.memory.data.amount) spirit.memory.data.amount = 0;
    spirit.memory.data.amount += 3;
    await spirit.commit();

    let stats = await req.db.Spirit.recallOne("stats");
    let render = [];
    let keys = Object.keys(stats.memory.data);
    for (let i = 0; i < keys.length; i++) {
        render.push(`${keys[i]} - ${stats.memory.data[keys[i]].visits}`)
    }
    console.log(render);
}