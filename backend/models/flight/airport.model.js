const mongoose = require('mongoose');

const airportSchema = new mongoose.Schema({
    name: { type: String, required: true },
    airportName: { type: String }, // Legacy/Data Compatibility
    iataCode: { type: String, unique: true, sparse: true, uppercase: true },
    airportCode: { type: String, unique: true, sparse: true, uppercase: true }, // Legacy/Data Compatibility
    icaoCode: { type: String, uppercase: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    latitude: { type: Number },
    longitude: { type: Number },
    timezone: { type: String },
    status: { type: Boolean, default: true },
    showInSearch: { type: Boolean, default: true },
    isPopular: { type: Boolean, default: false },
    priority: { type: Number, default: 0 },
    provider: { 
        type: String, 
        enum: ['Amadeus', 'Sabre', 'Manual'],
        default: 'Manual'
    },
    providerCode: { type: String },
    type: { 
        type: String, 
        enum: ['Domestic', 'International', 'Both'],
        default: 'Domestic'
    },
    airportTax: { type: Number, default: 0 },
    udf: { type: Number, default: 0 },
    serviceCharges: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

airportSchema.pre('save', function() {
    if (this.name && !this.airportName) this.airportName = this.name;
    if (this.airportName && !this.name) this.name = this.airportName;
    
    if (this.iataCode && !this.airportCode) this.airportCode = this.iataCode;
    if (this.airportCode && !this.iataCode) this.iataCode = this.airportCode;
});

module.exports = mongoose.model('Airport', airportSchema);
