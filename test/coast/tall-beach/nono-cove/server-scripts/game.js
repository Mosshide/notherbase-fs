const req = require("express/lib/request");

module.exports = async function gameServerScript(db) {
    try {
        let foundGame = await db.game.findOne({ name: "test" });

        if (!foundGame) {
            await db.game.create({
                name: "test",
                data: {
                    count: 0
                }
            });

            return 0;
        }
        else {
            let newCount = foundGame.data.count + 1;
            foundGame.data = {
                count: newCount
            }
            foundGame.markModified("data");
            await foundGame.save();

            return newCount;
        }
    }
    catch(err) {
        console.log(err);
    }
}