const mongoose = require('mongoose');

const flightPricingRuleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },

    applyOn: { 
        type: String, 
        enum: ['Global', 'Airline', 'Route'], 
        default: 'Global' 
    },
    airline: { type: mongoose.Schema.Types.ObjectId, ref: 'Airline' },
    route: { type: String }, // DEL-BOM

    markupType: { 
        type: String, 
        enum: ['Percentage', 'Fixed'], 
        required: true 
    },
    markupValue: { type: Number, required: true },

    convenienceFee: { type: Number, default: 0 },
    serviceFee: { type: Number, default: 0 },
    gst: { type: Number, default: 0 }, // In percentage

    minFare: { type: Number, default: 0 },
    maxFare: { type: Number, default: 0 },

    startDate: { type: Date },
    endDate: { type: Date },

    userType: { 
        type: String, 
        enum: ['SuperAdmin', 'Admin', 'Agent', 'B2C'],
        default: 'B2C'
    },

    status: { type: Boolean, default: true },
    priority: { type: Number, default: 0 },

    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('FlightPricingRule', flightPricingRuleSchema);
