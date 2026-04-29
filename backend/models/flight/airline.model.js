const mongoose = require('mongoose');

const airlineSchema = new mongoose.Schema({
    name: { type: String, required: true },
    airlineName: { type: String }, // Legacy/Data Compatibility
    iataCode: { type: String, unique: true, sparse: true, uppercase: true },
    airlineCode: { type: String, unique: true, sparse: true, uppercase: true }, // Legacy/Data Compatibility
    icaoCode: { type: String, uppercase: true },
    country: { type: String, required: true },
    logo: { type: String },
    themeColor: { type: String, default: '#3b82f6' },
    status: { type: Boolean, default: true },
    showInSearch: { type: Boolean, default: true },
    priority: { type: Number, default: 0 },
    
    // API Mapping
    provider: { 
        type: String, 
        enum: ['Amadeus', 'Sabre', 'Travelport', 'Mystifly', 'TBO', 'Manual'],
        default: 'Manual'
    },
    providerCode: { type: String },
    apiEnabled: { type: Boolean, default: false },
    
    // Pricing
    markupType: { type: String, enum: ['Fixed', 'Percentage'], default: 'Percentage' },
    markupValue: { type: Number, default: 0 },
    convenienceFee: { type: Number, default: 0 },
    
    // Commission
    agentCommission: { type: Number, default: 0 },
    adminCommission: { type: Number, default: 0 },
    
    // Policies
    baggage: {
        cabin: { type: String, default: '7kg' },
        checkin: { type: String, default: '15kg' }
    },
    cancellationPolicy: { type: String },
    refundPolicy: { type: String },
    
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

airlineSchema.pre('save', function() {
    if (this.name && !this.airlineName) this.airlineName = this.name;
    if (this.airlineName && !this.name) this.name = this.airlineName;
    
    if (this.iataCode && !this.airlineCode) this.airlineCode = this.iataCode;
    if (this.airlineCode && !this.iataCode) this.iataCode = this.airlineCode;
});

module.exports = mongoose.model('Airline', airlineSchema);
