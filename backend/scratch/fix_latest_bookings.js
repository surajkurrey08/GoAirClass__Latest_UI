
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const FlightBooking = require('../models/flight/flightBooking.model');
const Flight = require('../models/flight/flight.model');
const Airport = require('../models/flight/airport.model');
const Airline = require('../models/flight/airline.model');

async function fixRecentBookings() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const bookings = await FlightBooking.find()
            .populate({
                path: 'flightId',
                populate: [
                    { path: 'fromAirport' },
                    { path: 'toAirport' }
                ]
            })
            .sort({ createdAt: -1 })
            .limit(10);

        console.log(`Analyzing ${bookings.length} recent bookings...`);

        for (let booking of bookings) {
            let updated = false;
            const flight = booking.flightId;

            if (flight) {
                if (!booking.flightDetails.departureCity && flight.fromAirport?.city) {
                    booking.flightDetails.departureCity = flight.fromAirport.city;
                    updated = true;
                }
                if (!booking.flightDetails.arrivalCity && flight.toAirport?.city) {
                    booking.flightDetails.arrivalCity = flight.toAirport.city;
                    updated = true;
                }
                
                // Ensure airport names are correct too
                if ((!booking.flightDetails.departureAirport || booking.flightDetails.departureAirport === 'undefined') && flight.fromAirport?.name) {
                    booking.flightDetails.departureAirport = flight.fromAirport.name;
                    updated = true;
                }
                if ((!booking.flightDetails.arrivalAirport || booking.flightDetails.arrivalAirport === 'undefined') && flight.toAirport?.name) {
                    booking.flightDetails.arrivalAirport = flight.toAirport.name;
                    updated = true;
                }
            }

            if (updated) {
                // We use markModified because flightDetails is a nested object and might not be tracked correctly if changed deep
                booking.markModified('flightDetails');
                await booking.save();
                console.log(`✅ Updated booking ${booking.bookingId} (${booking.pnr})`);
            } else {
                console.log(`ℹ️ Booking ${booking.bookingId} already correct or flight data missing.`);
            }
        }

        console.log('Fix complete.');
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

fixRecentBookings();
