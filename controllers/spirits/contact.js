import { success } from "./util.js";

export default {
    contactNother: async function(req) {
        req.body.service = "contact";
        let contact = new req.db.Spirit(req.body);

        await contact.commit({
            user: req.session.currentUser,
            location: req.path,
            content: req.body.data.content
        });

        return success();
    }
}