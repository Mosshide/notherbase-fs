export default {
    serve: async (req, res) => {
        let script, result = null;
        let scriptPath = `${req.contentPath}${req.body.data.path}/${req.body.data.script}.js`;

        if (fs.existsSync(scriptPath)) {
            const foundUser = await req.db.user.findById(req.session.currentUser);
    
            script = await import(scriptPath);
            scriptResult = await script.default(req.db, foundUser, req.body);
        }

        return result;
    }
}