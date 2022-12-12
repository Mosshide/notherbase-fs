export let loginCheck = (req) => {
    check(req.session.currentUser, "Please login first.");
}

export let findUser = async (req, email = req.session.currentUser) => {
    let user = new req.db.User("user", email);
    let userData = await user.recall();

    check(userData, "User not found.");

    return user;
}

export let check = (checkee, failMsg) => {
    if (!checkee) throw {
        status: "failed",
        message: failMsg,
        isUpToDate: true,
        data: null
    };
}

export let success = (msg = "Update successful.", data = null, isUpToDate = false) => {
    return {
        status: "success",
        message: msg,
        isUpToDate: isUpToDate,
        data: data
    };
}

export let fail = (msg, data = null, isUpToDate = true) => {
    return {
        status: "failed",
        message: msg,
        isUpToDate: isUpToDate,
        data: data
    }
}