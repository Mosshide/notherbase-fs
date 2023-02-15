import mongoose from "mongoose";

export default class Spirit {
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

    static buildQuery = (options = {}, data = {}, id = null) => {
        let query = {};
        
        if (id) query = {
            _id: id
        };
        if (options) query = {
            ...query,
            ...options
        };
        if (data){
            let keys = Object.keys(data);
            for (let i = 0; i < keys.length; i++) {
                query[`data.${keys[i]}`] = data[keys[i]];
            }
        }
    
        return query;
    }

    static create = async (options, data) => {
        let spirit = new Spirit();

        spirit.memory = await Spirit.db.create({
            ...options,
            _lastUpdate: Date.now(),
            data: data
        });

        return spirit;
    }

    static recall = async (options = {}, data = {}, id = null) => {
        let spirit = new Spirit();

        let query = Spirit.buildQuery(options, data, id);

        let found = await Spirit.db.find(query);

        if (found) {
            spirit.memory = found;
            if (!spirit.memory.data) spirit.memory.data = {};
            
            return spirit;
        }
        else return null;
    }

    static recallOne = async (options = {}, data = {}, id = null) => {
        let spirit = new Spirit();

        let query = Spirit.buildQuery(options, data, id);

        let found = await Spirit.db.findOne(query);

        if (found) {
            spirit.memory = found;
            if (!spirit.memory.data) spirit.memory.data = {};
            
            return spirit;
        }
        else return null;
    }

    static recallOrCreate = async (options = {}, queryData = {}, initdata = {}) => {
        let spirit = new Spirit();

        let query = Spirit.buildQuery(options, queryData);

        let found = await Spirit.db.findOne(query);

        if (found) {
            spirit.memory = found;
            if (!spirit.memory.data) spirit.memory.data = {};
            
            return spirit;
        }
        else {
            options._lastUpdate = Date.now();
            let newSpirit = await Spirit.create(options, initdata);
            return newSpirit;
        }
    }

    static delete = async (options = {}, data = {}, id = null) => {
        let found = await Spirit.db.deleteMany(Spirit.buildQuery(options, data, id));

        return found.deletedCount;
    }

    constructor() {
        this.memory = {
            data: {}
        };
    }

    commit = async (data = this.memory.data) => {
        this.memory._lastUpdate = Date.now();

        this.memory.data = data;
        this.memory.markModified("data");
        await this.memory.save();

        return "Updated";
    }
};