import mongoose from "mongoose";

export default class Spirit {
    static check = (checkee, failMsg) => {
        if (!checkee) throw {
            status: "failed",
            message: failMsg,
            isUpToDate: true,
            data: null
        };
    }
    
    static success = (msg = "Update successful.", data = null, isUpToDate = false) => {
        return {
            status: "success",
            message: msg,
            isUpToDate: isUpToDate,
            data: data
        };
    }
    
    static fail = (msg, data = null, isUpToDate = true) => {
        return {
            status: "failed",
            message: msg,
            isUpToDate: isUpToDate,
            data: data
        }
    }

    constructor(req, options) {
        let defaultBody = {
            route: req.path,
            service: "default",
            scope: "global",
            parent: null,
            _lastUpdate: 0,
            data: {}
        }

        defaultBody = {
            ...defaultBody,
            ...req.body,
            ...options
        }

        this.req = req;
        this.req.body = defaultBody;
        
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

    static create = async (req) => {
        let spirit = new Spirit(req);

        this.time = Date.now();

        spirit.memory = await Spirit.db.create({ 
            route: this.body.route,
            service: this.body.service,
            scope: this.body.scope,
            parent: this.body.parent,
            _lastUpdate: this.time,
            data: data
        });

        return spirit;
    }

    static recall = async (req, query) => {
        let spirit = new Spirit(req);

        let found = await Spirit.db.find(query);

        if (found && new Date(found._lastUpdate) > new Date(req.body._lastUpdate)) {
            this.memory = found;
            this.time = found._lastUpdate;
            
            return found.data;
        }
        else return false;
    }


    static delete = null;
    static commit = null;

    

    commit = async (data = this.memory.data) => {
        this.time = Date.now();

        this.memory = await Spirit.db.updateOne({ 
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

        return true;
    }

    commitByData = async (which, query, data = this.memory.data) => {
        this.time = Date.now();

        this.memory = await Spirit.db.updateOne({ 
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
        }).where(`data.${which}`).equals(query);

        return true;
    }
    
    

    getAll = async () => {
        let found = await Spirit.db.find({ 
            route: this.body.route,
            service: this.body.service,
            scope: this.body.scope
        });

        if (found) {
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
        let found = await Spirit.db.findOne({ 
            route: this.body.route,
            service: this.body.service
        }).where(`data.${which}`).equals(query);

        if (found && new Date(found._lastUpdate) > new Date(this.body._lastUpdate)) {
            this.memory = found;
            this.time = found._lastUpdate;
            
            return found.data;
        }
        else return false;
    }

    delete = async () => {
        await Spirit.db.findOneAndDelete({ 
            route: this.body.route,
            service: this.body.service,
            scope: this.body.scope,
            parent: this.body.parent
        });
    }

    deleteByData = async (which, query) => {
        await Spirit.db.findOneAndDelete({ 
            route: this.body.route,
            service: this.body.service,
            scope: this.body.scope,
            parent: this.body.parent
        }).where(`data.${which}`).equals(query);
    }
};