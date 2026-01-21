import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();


// DB setup
mongoose.set('strictQuery', true);
mongoose.connection.on('connected', (err) => {
    console.log(`Mongoose connected to db`);
});
mongoose.connection.on('error', (err) => {
    console.log(`Mongoose ${err}`);
});
mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});
try {
    mongoose.connect(process.env.MONGODB_URI);
}
catch (err) {
    console.log(`Mongoose on connect: ${err}`);
}

/**
 * Curated Mongoose.js documents for use in bases.
 */
let spiritSchema = new mongoose.Schema({
    _lastUpdate: Number,
    service: String,
    parent: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "spirits",
        required: false
    },
    data: {},
    backups: []
});

/**
 * Commits new data to a spirit.
 * @param {Object} data Data to save.
 * @returns Updated
 */
spiritSchema.method("commit", async function(data = this.data, maxBackups = 5) {
    this._lastUpdate = Date.now();

    this.backups.unshift({
        _lastUpdate: Date.now(),
        data: this.data
    });
    if (maxBackups > 1) {
        while (this.backups.length > maxBackups) this.backups.pop();
    }
    this.data = data;
    this.markModified("backups");
    this.markModified("data");
    await this.save();

    return "Updated";
});

/**
 * Restores a backup by its index.
 * @param {Number} backupIndex The index of the backup to restore.
 * @returns Status message.
 */
spiritSchema.method("restoreBackup", async function(backupIndex) {
    if (backupIndex < 0 || backupIndex >= this.backups.length) return "Invalid backup index";
    let backup = this.backups[backupIndex];
    this.backups.unshift({
        _lastUpdate: Date.now(),
        data: this.data
    });
    this.data = backup.data;
    this.markModified("backups");
    this.markModified("data");
    await this.save();
    return "Restored";
});

let Spirit = mongoose.model('spirits', spiritSchema);

export default Spirit;