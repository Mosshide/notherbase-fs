export default async function emailTime(db, route, user, params) {
    try {
        await db.sendMail.send(params.toEmail, params.subject, params.html);

        return "Sent"
    } 
    catch(err) {
        console.log(err);
        return false;
    }
}