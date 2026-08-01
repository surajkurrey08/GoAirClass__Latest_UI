const mongoose = require('mongoose');
const { syncLocationsFromCleartrip } = require('./controllers/hotel/hotelController');
require('dotenv').config({ path: './.env' });

async function run() {
    console.log("Connecting to DB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Starting sync...");
    await syncLocationsFromCleartrip();
    console.log("Disconnecting...");
    mongoose.disconnect();
}
run().catch(console.error);
