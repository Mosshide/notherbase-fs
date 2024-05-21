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
        data: {},
        backups: [{
            _lastUpdate: Number,
            data: {}
        }]
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

    // static buildBackupQuery = (service, data = null, parent = null, id = null) => {
    //     let query = {
    //         service: service,
    //         parent: parent
    //     };
        
    //     if (id) query._id = id;
    //     else if (data){
    //         let keys = Object.keys(data);
    //         for (let i = 0; i < keys.length; i++) {
                
    //             query[`data.backups.0.data.${keys[i]}`] = data[keys[i]];
    //         }
    //     }
    
    //     return query;
    // }

    /**
     * Creates a spirit in the database.
     * @param {String} service The name of the spirit.
     * @param {Object} data An object with data to create the spirit with.
     * @param {ObjectID} parent The MongoDB id of the parent of the spirit to be created.
     * @returns A new spirit.
     */
    static create = async (service, data = {}, parent = null) => {
        let spirit = new Spirit();

        spirit.memory = await Spirit.db.create({
            service,
            parent,
            _lastUpdate: Date.now(),
            data: data,
            backups: []
        });

        return spirit;
    }

    /**
     * Recalls all spirits in the database with a given name.
     * @param {String} service The name of the spirit.
     * @param {ObjectID} parent The MongoDB id of the parent spirit to search by.
     * @param {Object} data An object with data to query the spirit by.
     * @param {ObjectID} id The exact id of the MongoDB document.
     * @returns All spirits found.
     */
    static recallAll = async (service, parent = null, data = {}, id = null) => {
        let spirits = [];

        let query = Spirit.buildQuery(service, data, parent, id);

        let found = await Spirit.db.find(query);

        if (found) {
            for (let i = 0; i < found.length; i++) {
                let spirit = new Spirit(found[i]);
                spirits.push(spirit);
                // convert old backups to new format
                if (spirit.memory.data?._backupsEnabled) {
                    spirit.memory.backups = spirit.memory.data.backups;
                    spirit.memory.data = spirit.memory.backups[0].data;
                    spirit.memory.markModified("backups");
                    await spirit.commit();
                }
            }

            return spirits;
        }
        else return null;
    }

    /**
     * Recalls one spirit from the database or creates a new one.
     * @param {String} service The name of the spirit.
     * @param {ObjectID} parent The MongoDB id of the parent spirit to search by.
     * @param {Object} data An object with data to query the spirit by.
     * @param {ObjectID} id The exact id of the MongoDB document.
     * @returns The spirit found or a new one created in the database.
     */
    static recallOne = async (service, parent = null, data = {}, id = null) => {
        let spirit = null;

        let query = Spirit.buildQuery(service, data, parent, id);

        let found = await Spirit.db.findOne(query);
        
        if (found) {
            spirit = new Spirit(found);

            // convert old backups to new format
            if (spirit.memory.data?._backupsEnabled) {
                spirit.memory.backups = spirit.memory.data.backups;
                spirit.memory.data = spirit.memory.backups[0].data;
                spirit.memory.markModified("backups");
                await spirit.commit();
            }

            return spirit;
        }
        else return null;
    }

    /**
     * Recalls or creates a spirit in the database.
     * @param {String} service The name of the spirit.
     * @param {ObjectID} parent The MongoDB id of the parent spirit to search by.
     * @param {Object} data An object with data to query the spirit by.
     * @param {ObjectID} id The exact id of the MongoDB document.
     * @returns The spirit found or a new one created in the database.
     */
    static recallOrCreateOne = async (service, parent = null, data = {}, id = null) => {
        let spirit = null;

        let query = Spirit.buildQuery(service, data, parent, id);

        let found = await Spirit.db.findOne(query);

        if (found) spirit = new Spirit(found);
        else spirit = await Spirit.create(service, data, parent);

        // convert old backups to new format
        if (spirit.memory.data?._backupsEnabled) {
            spirit.memory.backups = spirit.memory.data.backups;
            spirit.memory.data = spirit.memory.backups[0].data;
            spirit.memory.markModified("backups");
            await spirit.commit();
        }

        return spirit;
    }

    /**
     * Deletes all of the specified spirit.
     * @param {String} service The name of the spirit.
     * @param {ObjectID} parent The MongoDB id of the parent spirit to search with.
     * @param {Object} data An object with data to query the spirit by.
     * @param {ObjectID} id The exact id of the MongoDB document.
     * @returns The number of documents deleted.
     */
    static delete = async (service, parent = null, data = {}, id = null) => {
        let found = await Spirit.db.deleteMany(Spirit.buildQuery(service, data, parent, id));

        return found.deletedCount;
    }

    constructor(memory = {}) {
        this.memory = memory;
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
     * @param {Object} data Data to add to the backup.
     */
    addBackup = (data, max = 5) => {
        this.memory.backups.unshift({
            _lastUpdate: Date.now(),
            data: this.memory.data
        });

        this.memory.data = data;

        if (max > 1) {
            while (this.memory.backups.length > max) this.memory.backups.pop();
        }

        this.memory.markModified("backups");
    }
};