export default async (req, user, io) => {
    let spirit = await req.db.Spirit.recallOne("test-save3", user.id);
    console.log(req.body);

    await spirit.commit({
        text: req.body.text
    });
}