
const mongoose = require('mongoose');

const mealMasterSchema = new mongoose.Schema({
    // 1. BASIC INFORMATION
    mealCode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        enum: ['Veg', 'Non-Veg', 'Vegan', 'Jain', 'Diabetic', 'Gluten-Free'],
        required: true
    },

    // 2. PRICING DETAILS
    basePrice: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'INR'
    },
    taxIncluded: {
        type: Boolean,
        default: true
    },
    convenienceFee: {
        type: Number,
        default: 0
    },

    // 3. AIRLINE MAPPING
    applicableAirlines: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Airline'
    }],

    // 4. ROUTE / SECTOR MAPPING
    tripType: {
        type: String,
        enum: ['Domestic', 'International', 'Both'],
        default: 'Both'
    },
    sourceAirports: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Airport'
    }],
    destinationAirports: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Airport'
    }],

    // 5. PASSENGER APPLICABILITY
    applicableFor: {
        type: [String],
        enum: ['Adult', 'Child', 'Infant'],
        default: ['Adult', 'Child']
    },

    // 6. AVAILABILITY SETTINGS
    availabilityType: {
        type: String,
        enum: ['Pre-book', 'Onboard', 'Both'],
        default: 'Pre-book'
    },
    cutoffTime: {
        type: Number, // in hours
        default: 24
    },

    // 7. API INTEGRATION FIELDS
    externalMealCode: {
        type: String,
        trim: true
    },
    supplier: {
        type: String,
        trim: true
    },

    // 8. MEDIA
    image: {
        type: String // URL or path
    },

    // 9. STATUS & CONTROL
    status: {
        type: Boolean,
        default: true
    },
    priority: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('MealMaster', mealMasterSchema);
