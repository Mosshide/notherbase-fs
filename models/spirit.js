import mongoose from "mongoose";

/**
 * Curated Mongoose.js documents for use in bases.
 */
export default class Spirit {
    // The actual Mongoose.js model for accessing the database.
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

    /**
     * Builds query objects for Mongoose.js searches.
     * @param {String} service The name of the spirit.
     * @param {Object} data An object with data to query the spirit by.
     * @param {ObjectID} parent The MongoDB id of the parent spirit to search by.
     * @param {ObjectID} id The exact id of the MongoDB document.
     * @returns A query object.
     */
    static buildQuery = (service, data = null, parent = null, id = null) => {
        let query = {
            service: service,
            parent: parent
        };
        
        if (id) query._id = id;
        else if (data){
            let keys = Object.keys(data);
            for (let i = 0; i < keys.length; i++) {
                query[`data.${keys[i]}`] = data[keys[i]];
            }
        }
    
        return query;
    }

    /**
     * Creates a spirit in the database.
     * @param {String} service The name of the spirit.
     * @param {Object} data An object with data to create the spirit with.
     * @param {ObjectID} parent The MongoDB id of the parent of the spirit to be created.
     * @returns A new user spirit.
     */
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

    /**
     * Recalls all spirits in the database with a given name.
     * @param {String} service The name of the spirit.
     * @returns All spirits of the given name.
     */
    static recallAll = async (service) => {
        let spirit = new Spirit();

        let found = await Spirit.db.find({ service: service });

        if (found) {
            spirit.memory = found;
            
            return spirit;
        }
        else return null;
    }

    /**
     * Recalls one spirit from the database or creates a new one.
     * @param {String} service The name of the spirit.
     * @param {ObjectID} parent The MongoDB id of the parent spirit to search by.
     * @param {Object} data An object with data to query the spirit by.
     * @param {ObjectID} id The exact id of the MongoDB document.
     * @returns The spirit found or a new one created in the database..
     */
    static recallOne = async (service, parent = null, data = {}, id = null) => {
        let spirit = new Spirit();

        let query = Spirit.buildQuery(service, data, parent, id);

        let found = await Spirit.db.findOne(query);
        
        if (found) spirit.memory = found;
        else spirit = await Spirit.create(service, {}, parent);

        return spirit;
    }

    /**
     * Deletes all of the specified spirit.
     * @param {String} service The name of the spirit.
     * @param {Object} data An object with data to query the spirit by.
     * @param {ObjectID} parent The MongoDB id of the parent spirit to search with.
     * @param {ObjectID} id The exact id of the MongoDB document.
     * @returns The number of documents deleted.
     */
    static delete = async (service, data = {}, parent = null, id = null) => {
        let found = await Spirit.db.deleteMany(Spirit.buildQuery(service, data, id));

        return found.deletedCount;
    }

    constructor() {
        this.memory = {
            data: {}
        };
    }

    /**
     * Commits new data to a spirit.
     * @param {Object} data Data to save.
     * @returns Updated
     */
    commit = async (data = this.memory.data, which = -1) => {
        this.memory._lastUpdate = Date.now();

        if (!Array.isArray(this.memory)) {
            this.memory.data = data;
            this.memory.markModified("data");
            await this.memory.save();
        }
        else {
            for (let i = 0; i < this.memory.length; i++) {
                if (data) {
                    if (which < 0) this.memory[i].data = data;
                    else if (which === i) this.memory[i].data = data;
                }
                
                this.memory[i].markModified("data");
                await this.memory[i].save();
            }
        }

        return "Updated";
    }
};