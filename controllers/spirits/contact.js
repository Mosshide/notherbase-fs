export default {
    contactNother: async function(req, res) {
        try {
            await contact.create({
                user: req.session.currentUser,
                location: req.body.location,
                content: req.body.content
            });
    
            res.status(200).end();
        }
        catch(err) {
            res.status(500).end();
            console.log(err);
        }
    }
}