export default async function emailTime(req, user) {
    let goldCheck = req.db.Item.recall("Gold Coin");

    if (!goldCheck) req.db.Item.create("Gold Coin", "Gold Coin Short", "Gold Coin Long");

    let inv = user.memory.data.inventory;

    

    return "Sent";
}