
const mongoose = require('mongoose');

const mealMappingSchema = new mongoose.Schema({
    flightId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Flight',
        required: true,
        unique: true
    },
    mealAvailable: {
        type: Boolean,
        default: false
    },
    meals: [
        {
            mealCode: {
                type: String,
                required: true
            },
            name: String, // Denormalized for ease
            image: String, // URL/Path to image
            type: { type: String, default: 'Veg' }, // Veg/Non-Veg
            price: {
                type: Number,
                required: true,
                default: 0
            },
            stock: {
                type: Number,
                default: 100
            },
            available: {
                type: Boolean,
                default: true
            }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('FlightMealMapping', mealMappingSchema);
