import { findUser, success } from "./util.js";

export default {
    serve: async (req) => {
        let script, result = null;
        if (!req.body.route) req.body.route = req.path;
        let scriptPath = `${req.contentPath}${req.body.route}/${req.body.data.script}.js`;

        if (fs.existsSync(scriptPath)) {
            let user = findUser(req);
    
            script = await import(scriptPath);
            result = await script.default(req, user);
        }

        return success("Served.", result);
    }
}