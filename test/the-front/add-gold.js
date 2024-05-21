export default async (req, user, io) => {
    // let deleted = await req.db.Spirit.delete("gold");
    let spirit = await req.db.Spirit.recallOrCreateOne("gold");
    spirit.addBackup({
        amount: spirit.memory?.data?.amount != null ? spirit.memory.data.amount + 1 : 0
    });
    await spirit.commit();
}