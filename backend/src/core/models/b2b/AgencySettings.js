const mongoose = require('mongoose');

const agencySettingsSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    sequence: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('AgencySettings', agencySettingsSchema);
