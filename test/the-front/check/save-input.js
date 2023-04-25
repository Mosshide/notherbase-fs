export default async (req, user) => {
    let spirit = await req.db.Spirit.recallOne("test-save3", user.id);

    await spirit.commit({
        text: req.body.data.text
    });
}