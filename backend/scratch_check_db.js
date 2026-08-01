const mongoose = require('mongoose');
const HotelLocation = require('./models/hotel/HotelLocation');
require('dotenv').config({ path: './.env' });

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const count = await HotelLocation.countDocuments({});
    console.log("Total Hotel Locations in DB:", count);
    const sample = await HotelLocation.find({}).limit(5);
    console.log("Sample Locations:", sample);
    mongoose.disconnect();
}
check();
