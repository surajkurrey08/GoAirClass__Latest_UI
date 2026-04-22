const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Flight = require('./models/flight/flight.model');
const FlightBooking = require('./models/flight/flightBooking.model');
const { generatePNR, generateTicketNumber, generateBookingId } = require('./utils/flightIdentifiers');

async function verify() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Get a sample flight
        const flight = await Flight.findOne();
        if (!flight) {
            console.error('No flights found');
            return;
        }

        // 2. Mock booking request
        const bookingData = {
            userId: null,
            flightId: flight._id,
            flightDetails: {
                airline: 'Test Air',
                flightNumber: flight.flightNumber,
                departureAirport: 'DEL',
                arrivalAirport: 'BOM',
                departureCity: 'Delhi',
                arrivalCity: 'Mumbai',
                departureTime: new Date('2026-03-15T10:00:00Z'),
                durationMinutes: 140, // 2h 20m
                aircraft: 'Boeing 737',
                terminal: 'T3'
            },
            passengers: [{
                firstName: 'Test',
                lastName: 'User',
                gender: 'Male',
                dateOfBirth: new Date('1995-05-15'),
                seatNumber: '12A',
                seatType: 'Premium',
                seatPrice: 785,
                baggage: '20kg',
                meal: 'Non-Veg'
            }],
            contactDetails: {
                email: 'test@example.com',
                phone: '+918767605792'
            },
            fareDetails: {
                baseFare: 5000,
                taxes: 600,
                seatFee: 785,
                addons: 100,
                discount: 50
                // totalAmount omitted to test auto-calculation
            },
            currency: 'INR',
            bookingId: 'BK-ADV-' + Date.now(),
            bookingStatus: 'PENDING',
            paymentStatus: 'PENDING',
            ticketStatus: 'PENDING',
            bookingSource: 'WEB'
        };

        const booking = new FlightBooking(bookingData);
        await booking.save();

        console.log('✅ Booking created successfully');
        console.log('Calculated totalAmount:', booking.fareDetails.totalAmount);
        console.log('Calculated arrivalTime:', booking.flightDetails.arrivalTime);
        console.log('Calculated boardingTime:', booking.flightDetails.boardingTime);

        // Verify Calculations
        const expectedTotal = (5000 + 600 + 785 + 100) - 50;
        if (booking.fareDetails.totalAmount !== expectedTotal) {
            console.error(`❌ totalAmount mismatch. Expected: ${expectedTotal}, Got: ${booking.fareDetails.totalAmount}`);
        }

        const expectedArrival = new Date(new Date('2026-03-15T10:00:00Z').getTime() + 140 * 60000);
        if (booking.flightDetails.arrivalTime.getTime() !== expectedArrival.getTime()) {
            console.error(`❌ arrivalTime mismatch. Expected: ${expectedArrival}, Got: ${booking.flightDetails.arrivalTime}`);
        }

        // 3. Test Invalid Data (Validation)
        try {
            const invalidBooking = new FlightBooking({
                ...bookingData,
                contactDetails: { email: 'shivamgmail.com', phone: '9123456' },
                bookingId: 'BK-INVALID'
            });
            await invalidBooking.save();
            console.error('❌ Validation failed: Invalid email/phone were accepted');
        } catch (err) {
            console.log('✅ Validation worked: Invalid data rejected as expected');
        }

        // Cleanup
        await FlightBooking.deleteOne({ _id: booking._id });
        console.log('Cleanup finished.');


    } catch (err) {
        console.error('Verification failed:', err);
    } finally {
        await mongoose.disconnect();
    }
}

verify();
