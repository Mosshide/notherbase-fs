commit = async (req, res) => {
    let spirit = new req.Spirit(req.body);
    let result = await spirit.commit(req.body.data);
    return result;
}

recall = async (req, res) => {
    let spirit = new req.Spirit(req.body);
    let memory = await spirit.recall.data;
    return memory;
}