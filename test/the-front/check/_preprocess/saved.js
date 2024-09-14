export default async (req, user, io) => {
    if (user) {
        let spirit = await req.db.Spirit.recallOne("test-save3", user.memory._id);
    
        return spirit.memory.data.text;
    }

    return "Not Logged In";
}