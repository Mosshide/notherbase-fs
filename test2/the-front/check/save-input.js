export default async (req, user, io) => {
    let spirit = await req.db.Spirit.recallOne("test-save3", user.memory._id);
    // console.log(req.body.text, spirit.memory);

    await spirit.commit({
        text: req.body.text
    });
}