
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

const FlightInventory = require('./backend/models/flight/flightInventory.model');

async function checkFlights() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const count = await FlightInventory.countDocuments();
        console.log(`Total FlightInventory documents: ${count}`);

        const allFlights = await FlightInventory.find({}).limit(5);
        console.log('Sample Flights:', JSON.stringify(allFlights, null, 2));

        const query = {
            from: "DEL",
            to: "BOM",
            status: true
        };
        
        // Let's try to match exactly what the user is searching for
        // User date: 28/04/2026
        const searchDate = new Date('2026-04-28T00:00:00.000Z');
        const nextDate = new Date('2026-04-28T23:59:59.999Z');
        query.departureDate = { $gte: searchDate, $lte: nextDate };
        
        console.log('Running query:', JSON.stringify(query, null, 2));
        const matchedFlights = await FlightInventory.find(query);
        console.log(`Matched Flights count: ${matchedFlights.length}`);
        if (matchedFlights.length > 0) {
            console.log('Matched Flights:', JSON.stringify(matchedFlights, null, 2));
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

checkFlights();
