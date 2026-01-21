export default async (req, user, io) => {
    if (!user) return "No user logged in";
    let spirit = await req.Spirit.findOne({ service: "gold", parent: user._id });
    await spirit.commit({ amount: spirit.data?.amount != null ? spirit.data.amount + 1 : 1 });
    return spirit.data.amount;
}