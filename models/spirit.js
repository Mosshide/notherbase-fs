import mongoose from "mongoose";

let buildQuery = (options = {}, data = {}, id = null) => {
    let query = {};
    
    if (id) query = {
        _id: id
    };
    if (options) query = {
        ...query,
        ...options
    };
    if (data) query = {
        ...query,
        data: data
    };

    return query;
}

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

        let query = buildQuery(options, data, id);

        let found = await Spirit.db.find(query);

        if (found) {
            spirit.memory = found;
            
            return spirit;
        }
        else return null;
    }

    static delete = async (options = {}, data = {}, id = null) => {
        let found = await Spirit.db.findAndDelete(buildQuery(options, data, id));

        return found.deletedCount;
    }

    constructor() {
        this.memory = {
            data: {}
        };
    }

    buildQuery = buildQuery;

    check = (checkee, failMsg) => {
        if (!checkee) throw {
            status: "failed",
            message: failMsg,
            isUpToDate: true,
            data: null
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