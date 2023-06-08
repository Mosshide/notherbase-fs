export default async (req, user, io) => {
    let bigSwitch = await req.db.Spirit.recallOne("big-switch");

    if (!bigSwitch.memory.data.flipped) await bigSwitch.commit({ flipped: true });
    else await bigSwitch.commit({ flipped: false });
    console.log(bigSwitch.memory.data);

    io.to("big-switch").emit("big-switch", { flipped: bigSwitch.memory.data.flipped });
    return "success";
}