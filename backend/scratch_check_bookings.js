const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const dbUri = process.env.MONGO_URI || 'mongodb://localhost:27017/goairclass';

mongoose.connect(dbUri)
    .then(async () => {
        console.log('Connected to DB successfully.');
        const HotelBooking = require('./models/hotel/HotelBooking');
        const count = await HotelBooking.countDocuments();
        console.log('Total HotelBookings count:', count);
        const sample = await HotelBooking.find().limit(5);
        console.log('Sample HotelBookings:', JSON.stringify(sample, null, 2));
        process.exit(0);
    })
    .catch(err => {
        console.error('DB connection error:', err);
        process.exit(1);
    });
