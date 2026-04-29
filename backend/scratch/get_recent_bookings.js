
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const FlightBooking = require('../models/flight/flightBooking.model');

async function getRecentBookings() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const bookings = await FlightBooking.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        console.log('Recent Bookings:');
        console.log(JSON.stringify(bookings, null, 2));

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

getRecentBookings();
