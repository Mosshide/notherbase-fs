export default async (req, user, io) => {
    // let deleted = await req.db.Spirit.delete("gold");
    let spirit = await req.db.Spirit.recallOrCreateOne("gold");
    spirit.addBackup({
        amount: spirit.memory?.data?.amount != null ? spirit.memory.data.amount + 1 : 1
    });
    await spirit.commit();

    spirit = await req.db.Spirit.recallOrCreateOne("gold", user.memory._id);
    spirit.addBackup({
        amount: spirit.memory?.data?.amount != null ? spirit.memory.data.amount + 1 : 1
    });
    await spirit.commit();
}