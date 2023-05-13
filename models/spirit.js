import mongoose from "mongoose";

export default class Spirit {
    static db = mongoose.model('spirits', new mongoose.Schema({
        _lastUpdate: Number,
        service: String,
        parent: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "spirits",
            required: false
        },
        data: {}
    }));

    static buildQuery = (service, data = null, parent = null, id = null) => {
        let query = {
            service: service,
            parent: parent
        };
        
        if (id) query._id = id;

        if (data){
            let keys = Object.keys(data);
            for (let i = 0; i < keys.length; i++) {
                query[`data.${keys[i]}`] = data[keys[i]];
            }
        }
    
        return query;
    }

    static create = async (service, data = {}, parent = null) => {
        let spirit = new Spirit();

        spirit.memory = await Spirit.db.create({
            service,
            parent,
            _lastUpdate: Date.now(),
            data: data
        });

        return spirit;
    }

    static recallAll = async (service) => {
        let spirit = new Spirit();

        let query = Spirit.buildQuery(service);

        let found = await Spirit.db.find({
            service: service
        });

        if (found) {
            spirit.memory = found;
            
            return spirit;
        }
        else return null;
    }

    static recallOne = async (service, parent = null, data = {}, id = null) => {
        let spirit = new Spirit();

        let query = Spirit.buildQuery(service, data, parent, id);

        let found = await Spirit.db.findOne(query);

        if (found) {
            spirit.memory = found;
            return spirit;
        }
        else {
            let newSpirit = await Spirit.create(service, {}, parent);
            return newSpirit;
        }
    }

    static delete = async (service, data = {}, id = null) => {
        let found = await Spirit.db.deleteMany(Spirit.buildQuery(service, data, id));

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