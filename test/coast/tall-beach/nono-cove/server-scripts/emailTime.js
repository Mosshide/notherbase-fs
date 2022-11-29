module.exports = async function addToTimer(db, route, user, params) {
    try {
        return await db.sendMail.send(params.toEmail, params.subject, params.html);
    } 
    catch(err) {
        console.log(err);
        return false;
    }
}