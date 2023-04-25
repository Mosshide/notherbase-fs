export default async function emailTime(req, user) {
    await req.db.SendMail.send(
        req.body.data.toEmail, 
        req.body.data.subject, 
        req.body.data.html
    );

    return "Sent";
}