import mongoose from "mongoose";

export default class Spirit {
    constructor(body = {}) {
        this.body = body;
        if (!this.body.route) this.body.route = "/";
        if (!this.body.service) this.body.service = "default"; 
        if (!this.body.scope) this.body.scope = "global";
        if (!this.body.parent) this.body.parent = null;
        if (!this.body._lastUpdate) this.body._lastUpdate = 0;
        if (!this.body.data) this.body.data = {};
        this.memory = {
            data: {}
        };
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

    create = async (data = this.memory.data) => {
        this.time = Date.now();

        await Spirit.db.create({ 
            route: this.body.route,
            service: this.body.service,
            scope: this.body.scope,
            parent: this.body.parent,
            _lastUpdate: this.time,
            data: data
        });

        this.memory.data = data;

        return true;
    }

    commit = async (data = this.memory.data) => {
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

        this.memory.data = data;

        return true;
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
            
            return found.data;
        }
        else return false;
    }

    getAll = async () => {
        let found = await Spirit.db.find({ 
            route: this.body.route,
            service: this.body.service,
            scope: this.body.scope
        });

        if (found && new Date(found._lastUpdate) > new Date(this.body._lastUpdate)) {
            this.memory = found;
            this.time = found._lastUpdate;

            let takeout = [];
            for (let i = 0; i < found.length; i++) {
                takeout.push(found[i].data)
            }
            
            return takeout;
        }
        else return false;
    }

    recallFromData = async (which, query) => {
        console.log(this.body);
        let found = await Spirit.db.findOne({ 
            route: this.body.route,
            service: this.body.service
        }).where(`data.${which}`).equals(query);

        console.log(found);

        if (found && new Date(found._lastUpdate) > new Date(this.body._lastUpdate)) {
            this.memory = found;
            this.time = found._lastUpdate;
            
            return found.data;
        }
        else return false;
    }

    delete = async (which, query) => {
        await Spirit.db.findOneAndDelete({ 
            route: this.body.route,
            service: this.body.service,
            scope: this.body.scope,
            parent: this.body.parent
        }).where(`data.${which}`).equals(query);
    }
};