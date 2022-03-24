const { user, connectionSuccess } = require("../models");

const authCheck = async function authCheck(req, res, next){
    if (connectionSuccess) {
        try {
            if (req.session.currentUser) {
                const foundAccount = await user.findById(req.session.currentUser);
        
                if (foundAccount) {
                    req.session.currentUserFull = foundAccount;
                    next();
                }
                else {
                    req.session.currentUserFull = null;
                    res.redirect("/the-front");
                }
            }
            else{
                res.redirect("/the-front");
            }
        }
        catch(err) {
            console.log("database error");
            console.log(err);
        }
    }
    else {
        console.log("AuthCheck failed: not connected to db");
        req.session.currentUserFull = null;
        res.redirect("/the-front");
    }
}

module.exports = authCheck;