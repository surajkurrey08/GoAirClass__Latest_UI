const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
    busName: { type: String, required: true },
    busType: { type: String, required: true },
    totalSeats: { type: Number, required: true },
    busNumber: { type: String, required: true },
    operator: { type: mongoose.Schema.Types.ObjectId, ref: 'Operator', required: true },
    amenities: [{ type: String }], // AC, WiFi, Charging, Blanket, etc.
    images: [{ type: String }], // Store image paths
    seatLayout: [{
        seatNo: String,
        type: { type: String, enum: ['seater', 'sleeper', 'ladies', 'ladies-sleeper'] },
        deck: { type: String, enum: ['lower', 'upper'], default: 'lower' },
        price: Number
    }],
    status: { 
        type: String, 
        enum: ['active', 'inactive', 'pending', 'under_review', 'approved', 'live', 'suspended', 'rejected', 'draft'], 
        default: 'draft' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Bus', busSchema);
