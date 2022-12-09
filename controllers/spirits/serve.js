export default {
    serve: async (req, res) => {
        let script, result = null;
        let scriptPath = `${req.contentPath}${req.body.data.path}/${req.body.data.script}.js`;

        if (fs.existsSync(scriptPath)) {
            let spirit = new req.Spirit("/user", req.session.currentUser);
            let foundUser = await spirit.recall().data;
    
            script = await import(scriptPath);
            scriptResult = await script.default(req, foundUser);
        }

        return result;
    }
}