/**
 * Check if something is true. Respond with a fail otherwise.
 * @param {Object} res An Express.js response.
 * @param {*} checkee What to check against.    
 * @param {String} failMsg Message to send in a potential failure response.
 * @returns True or false.
 */
export const check = (res, checkee, failMsg = "Failed!") => {
    if (!checkee) {
        fail(res, failMsg);
        return false;
    }
    else {
        return true;
    }
};

/**
 * Respond to the client with success.
 * @param {Object} res An Express.js response.
 * @param {String} msg A message describing the success.
 * @param {Object} data Data to send with the response.
 * @param {Number} lastUpdate A number date for synchronization.
 */
export const success = (res, msg = "Success!", data = null, lastUpdate = 0) => {
    res.send({
        status: "success",
        message: msg,
        lastUpdate: lastUpdate,
        data: data
    });
};

/**
 * Respond to the client with failure.
 * @param {Object} res An Express.js response.
 * @param {String} msg A message describing the failure.
 */
export const fail = (res, msg = "Failed!") => {
    res.send({
        status: "failed",
        message: msg,
        lastUpdate: 0,
        data: null
    });
};

/**
 * Check if a user is logged in.
 * @param {Object} req An Express.js request.
 * @param {Object} res An Express.js response.
 * @returns True if a user is logged in, else false.
 */
export const loginCheck = (req, res) => {
    return check(res, req.session.currentUser, "Please login first.");
}