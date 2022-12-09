commit = async (req, res) => {
    try {
        await req.db.detail.updateOne({ 
            route: req.body.route,
            service: req.body.service,
            scope: "local",
            user: req.session.currentUser
        }, { 
            route: req.body.route,
            service: req.body.service,
            scope: "local",
            user: req.session.currentUser,
            _lastUpdate: req.body.time,
            data: req.body.data
        }, {
            upsert: true
        });

        res.send("Update successful!");
    }
    catch(err) {
        console.log(err);
        res.status(500).end();
    }
}

recall = async (req, res) => {
    try {
        let exists = await req.db.detail.exists({ 
            route: req.query.route,
            service: req.query.service,
            scope: "local",
            user: req.session.currentUser
        });

        if (!exists) {
            await req.db.detail.create({
                _lastUpdate: Date.now(),
                route: req.query.route,
                service: req.query.service,
                scope: "local",
                user: req.session.currentUser,
                data: {}
            });
        }

        let found = await req.db.detail.findOne({ 
            route: req.query.route,
            service: req.query.service,
            scope: "local",
            user: req.session.currentUser
        });

        if (new Date(found._lastUpdate) > new Date(req.query._lastUpdate)) {
            res.send({
                isUpToDate: false,
                data: found.data
            });
        }
        else res.send({
            isUpToDate: true,
            data: null
        });
    }
    catch(err) {
        console.log(err);
        res.status(500).end();
    }
}