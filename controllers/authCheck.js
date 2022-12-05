import { connectionSuccess } from "../models/index.js";

const authCheck = async function authCheck(req, res, next){
    if (connectionSuccess) {
        if (req.session.currentUser) {
            next();
        }
        else {
            res.redirect("/the-front");
        }
    }
    else {
        console.log("AuthCheck failed: not connected to db");
        res.redirect("/the-front");
    }
}

export default authCheck;