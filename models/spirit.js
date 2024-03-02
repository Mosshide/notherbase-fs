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
    static recallAll = async (service, parent = null, data = {}, id = null) => {
        let spirit = new Spirit();

        let query = Spirit.buildQuery(service, data, parent, id);

        let found = await Spirit.db.find(query);

        if (found) {
            spirit.memory = found;
            return spirit;
        }
        else return null;
    }

    /**
     * Recalls any spirit from the database.
     * @param {String} service The name of the spirit.
     * @returns Any spirit found.
     */
    static recallAny = async (service) => {
        let spirit = new Spirit();

        let found = await Spirit.db.findOne({ service: service });

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
    commit = async (data = this.memory.data) => {
        this.memory._lastUpdate = Date.now();

        this.memory.data = data;
        this.memory.markModified("data");
        await this.memory.save();

        return "Updated";
    }

    /**
     * Normalizes the data property to an array.
     */
    normalizeDataToArray = () => {
        if (!Array.isArray(this.memory.data)) this.memory.data = [];
    }

    /**
     * Adds a new backup to the spirit's data.
     * If backups have not already been enabled, the old dat will be moved to a backup.
     * @param {Object} data Data to add to the backup.
     */
    addBackup = async (data, max = 5) => {
        if (!this.memory.data._backupsEnabled) {
            let oldData = this.memory.data;
            this.memory.data = {
                _backupsEnabled: true,
                backups: [ oldData ]
            };
        }
        else {
            this.memory.data.backups.unshift({
                _lastUpdate: Date.now(),
                data: data
            });

            if (max > 1) {
                while (this.memory.data.backups.length > max) this.memory.data.backups.pop();
            }
        }
    }
};