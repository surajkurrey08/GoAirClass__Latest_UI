const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Flight = require('./models/flight/flight.model');
const Airport = require('./models/flight/airport.model');
const Airline = require('./models/flight/airline.model');

async function diagnose() {
    try {
        console.log('Connecting to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const flights = await Flight.find().populate('airlineId').populate('fromAirport').populate('toAirport');
        console.log(`Found ${flights.length} flights`);

        if (flights.length > 0) {
            const f = flights[0];
            console.log('Sample Flight Data:', JSON.stringify({
                _id: f._id,
                flightNumber: f.flightNumber,
                departureTime: f.departureTime,
                departureTimeType: typeof f.departureTime,
                isDate: f.departureTime instanceof Date,
                airlineName: f.airlineId?.airlineName,
                fromCode: f.fromAirport?.airportCode
            }, null, 2));
        } else {
            console.log('No flights found in database!');
        }

        console.log('Razorpay Key ID:', process.env.RAZORPAY_KEY_ID ? 'SET' : 'MISSING');
        console.log('Razorpay Secret:', process.env.RAZORPAY_KEY_SECRET ? 'SET' : 'MISSING');

    } catch (err) {
        console.error('Diagnosis failed:', err);
    } finally {
        await mongoose.disconnect();
    }
}

diagnose();
