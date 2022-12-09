import { findUser, success } from "./util";

export default {
    serve: async (req) => {
        let script, result = null;
        let scriptPath = `${req.contentPath}${req.path}/${req.body.data.script}.js`;

        if (fs.existsSync(scriptPath)) {
            let user = findUser(req);
    
            script = await import(scriptPath);
            result = await script.default(req, user);
        }

        return success("Served.", result);
    }
}