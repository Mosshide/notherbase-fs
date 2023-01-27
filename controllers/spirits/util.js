export const check = (res, checkee, failMsg = "Failed!") => {
    if (!checkee) {
        fail(res, failMsg);
        return false;
    }
    else {
        return true;
    }
};

export const success = (res, msg = "Success!", data = null, lastUpdate = 0) => {
    res.send({
        status: "success",
        message: msg,
        lastUpdate: lastUpdate,
        data: data
    });
};

export const fail = (res, msg = "Failed!") => {
    res.send({
        status: "failed",
        message: msg,
        lastUpdate: 0,
        data: null
    });
};

export const loginCheck = (req, res) => {
    return check(res, req.session.currentUser, "Please login first.");
}