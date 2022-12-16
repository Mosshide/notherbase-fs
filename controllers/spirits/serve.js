import { findUser, success, fail } from "./util.js";
import fs from "fs";

let serve = async (req, scriptPath) => {
    let script, result = null;

    if (fs.existsSync(scriptPath)) {
        let user = await findUser(req);

        script = await import(scriptPath);
        result = await script.default(req, user);
        return success("Served.", result);
    }
    else return fail(`Script not found: ${req.body.data.script} at ${scriptPath}`);
}

export default {
    serveExplorer: async (req) => {
        let scriptPath = `${req.contentPath}/explorer${req.body.route}/server-scripts/${req.body.data.script}.js`;
        
        return serve(req, scriptPath);
    },
    serveFront: async (req) => {
        let scriptPath = `${req.contentPath}/the-front/server-scripts/${req.body.data.script}.js`;
        
        return serve(req, scriptPath);
    },
    servePages: async (req) => {
        let scriptPath = `${req.contentPath}/pages/server-scripts/${req.body.data.script}.js`;
        
        return serve(req, scriptPath);
    }
}