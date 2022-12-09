import {loginCheck, check, findUser, fail, success} from "./util.js";

export default {
    attributes: async (req) => {
        loginCheck(req);

        let user = await findUser(req);

        return success("Got user attributes.", user.memory.data.attributes);
    },
    checkAttribute: async (req) => {
        loginCheck(req);

        let user = await findUser(req);
        let att = user.memory.data.attributes;

        if (att[req.body.data.check] >= parseInt(req.body.data.against)) {
            return success("Passed check.")
        }
        else return fail("Failed check.");
    },
    setAttributes: async (req) => {
        loginCheck(req);

        let user = await findUser(req);

        user.memory.data.attributes[req.body.change] = parseInt(req.body.data.to);
        await user.commit();

        return success("Attributes set.");
    },
    incrementAttribute: async (req) => {
        loginCheck(req);

        let user = await findUser(req);
        let att = user.memory.data.attributes;

        if (att[req.body.data.change] < req.body.data.max) {
            att[req.body.data.change]++;
            await user.commit();

            return success("Attribute incremented.", att[req.body.change]);
        } 
        else return fail("Attribute maxed.", att[req.body.change]);
    }
}

