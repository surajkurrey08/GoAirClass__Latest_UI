const mongoose = require('mongoose');

const flightSettingSchema = new mongoose.Schema({
    flightEnabled: { type: Boolean, default: true },
    bookingFee: { type: Number, default: 0 },
    taxPercent: { type: Number, default: 0 },
    cancellationPolicy: { type: String, default: '' },
    refundPolicy: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('FlightSetting', flightSettingSchema);
