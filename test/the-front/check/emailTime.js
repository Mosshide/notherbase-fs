export default async function emailTime(req, user) {
    await req.db.SendMail.send(
        'wyattsushi@gmail.com',
        'Test',
        'sdntndtjln l',
        "NB"
    );

    return "Sent";
}