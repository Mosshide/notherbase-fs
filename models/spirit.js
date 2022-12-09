import mongoose from "mongoose";

export default class Spirit {
    constructor(body = {}) {
        this.body = body;
        if (!this.body.route) this.body.route = "/";
        if (!this.body.service) this.body.service = "default"; 
        if (!this.body.scope) this.body.scope = "global";
        if (!this.body.parent) this.body.parent = null;
        if (!this.body._lastUpdate) this.body._lastUpdate = 0;
        if (!this.body.token) this.body.token = -1;
        if (!this.body.data) this.body.data = {};
        this.memory = null;
        this.time = Date.now();
    }

    static db = mongoose.model('spirits', new mongoose.Schema({
        _lastUpdate: Number,
        route: String,
        service: String,
        scope: String,
        parent: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "spirits",
            required: false
        },
        data: {}
    }));

    commit = async (data) => {
        this.time = Date.now();

        await Spirit.db.updateOne({ 
            route: this.body.route,
            service: this.body.service,
            scope: this.body.scope,
            parent: this.body.parent
        }, { 
            route: this.body.route,
            service: this.body.service,
            scope: this.body.scope,
            parent: this.body.parent,
            _lastUpdate: this.time,
            data: data
        }, {
            upsert: true
        });

        this.memory = data;

        return "Update successful!";
    }
    
    recall = async () => {
        let found = await Spirit.db.findOne({ 
            route: this.body.route,
            service: this.body.service,
            scope: this.body.scope,
            parent: this.body.parent
        });

        if (found && new Date(found._lastUpdate) > new Date(this.body._lastUpdate)) {
            this.memory = found;
            this.time = found._lastUpdate;
            
            return {
                isUpToDate: false,
                data: found.data
            };
        }
        else return {
            isUpToDate: true,
            data: null
        };
    }

    recallFromData = async (which, query) => {
        let found = await Spirit.db.findOne({ 
            route: this.body.route,
            service: this.body.service
        }).where(`data.${which}`).equals(query);

        if (found && new Date(found._lastUpdate) > new Date(this.body._lastUpdate)) {
            this.memory = found;
            this.time = found._lastUpdate;
            
            return {
                isUpToDate: false,
                data: found.data
            };
        }
        else return {
            isUpToDate: true,
            data: null
        };
    }

    delete = async () => {
        await Spirit.db.findOneAndDelete({ 
            route: this.body.route,
            service: this.body.service,
            scope: this.body.scope,
            parent: this.body.parent
        });
    }
};