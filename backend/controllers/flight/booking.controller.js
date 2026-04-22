const Flight = require('../../models/flight/flight.model');
const FlightBooking = require('../../models/flight/flightBooking.model');
const SeatInventory = require('../../models/flight/seatInventory.model');
const { generateBookingId } = require('../../utils/flightIdentifiers');

const createFlightBooking = async (req, res) => {
    try {
        const { flightId, passengers, contactDetails, fareDetails, currency, bookingSource } = req.body;
        const userId = req.user?.id;

        if (!flightId) {
            return res.status(400).json({ success: false, message: 'flightId is required' });
        }

        const flight = await Flight.findById(flightId)
            .populate('airlineId')
            .populate('fromAirport')
            .populate('toAirport');

        if (!flight) {
            return res.status(404).json({ success: false, message: 'Flight not found' });
        }

        if (!Array.isArray(passengers) || passengers.length === 0) {
            return res.status(400).json({ success: false, message: 'Passenger details are required' });
        }

        // Validate seats
        for (const p of passengers) {
            if (!p.seatNumber) {
                return res.status(400).json({ success: false, message: `Seat number is required for passenger ${p.firstName} ${p.lastName}` });
            }
        }

        if (!contactDetails || !contactDetails.email || !contactDetails.phone) {
            return res.status(400).json({ success: false, message: 'Contact details are required' });
        }

        // Calculate duration in minutes if not directly available
        const depTime = new Date(flight.departureTime);
        const arrTime = new Date(flight.arrivalTime);
        const durationMinutes = Math.floor((arrTime - depTime) / (1000 * 60));

        const bookingData = {
            userId: userId || null,
            flightId: flight._id,
            flightDetails: {
                airline: flight.airlineId?.airlineName || flight.airlineName || 'Airline',
                flightNumber: flight.flightNumber,
                departureAirport: flight.fromAirport?.airportCode || 'DEP',
                arrivalAirport: flight.toAirport?.airportCode || 'ARR',
                departureCity: flight.fromAirport?.city || 'Departure City',
                arrivalCity: flight.toAirport?.city || 'Arrival City',
                departureTime: flight.departureTime,
                durationMinutes: durationMinutes || 0,
                aircraft: flight.aircraftType,
                terminal: flight.terminal || 'T1'
            },
            passengers: passengers.map(p => ({
                firstName: p.firstName,
                lastName: p.lastName,
                gender: p.gender,
                dateOfBirth: p.dateOfBirth,
                nationality: p.nationality,
                passportNumber: p.passportNumber,
                passportExpiry: p.passportExpiry,
                seatNumber: p.seatNumber,
                seatType: p.seatType,
                seatPrice: Number(p.seatPrice) || 0
            })),
            contactDetails: {
                email: contactDetails.email,
                phone: contactDetails.phone
            },
            fareDetails: {
                baseFare: Number(fareDetails?.baseFare) || 0,
                taxes: Number(fareDetails?.taxes) || 0,
                seatFee: Number(fareDetails?.seatFee) || 0,
                addons: Number(fareDetails?.addons) || 0,
                discount: Number(fareDetails?.discount) || 0
                // totalAmount is calculated in pre-save hook
            },
            currency: currency || 'INR',
            bookingId: generateBookingId(),
            bookingStatus: 'CONFIRMED',
            paymentStatus: req.body.paymentStatus || 'PENDING',
            ticketStatus: 'ISSUED',
            bookingSource: bookingSource || 'WEB'
        };

        const booking = new FlightBooking(bookingData);
        await booking.save();

        res.status(201).json({ success: true, booking });
    } catch (err) {
        console.error('Booking creation error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

const getAllBookings = async (req, res) => {
    try {
        const bookings = await FlightBooking.find()
            .populate('userId')
            .populate({
                path: 'flightId',
                populate: [{ path: 'airlineId' }, { path: 'fromAirport' }, { path: 'toAirport' }]
            })
            .sort({ createdAt: -1 });
        res.json({ success: true, bookings });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const getBookingById = async (req, res) => {
    try {
        const booking = await FlightBooking.findOne({ bookingId: req.params.bookingId })
            .populate('userId')
            .populate({
                path: 'flightId',
                populate: [{ path: 'airlineId' }, { path: 'fromAirport' }, { path: 'toAirport' }]
            });
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
        res.json({ success: true, booking });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const updateBookingStatus = async (req, res) => {
    try {
        const { bookingStatus } = req.body;
        const booking = await FlightBooking.findByIdAndUpdate(
            req.params.id,
            { bookingStatus },
            { new: true }
        );
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
        res.json({ success: true, booking });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const getUserBookings = async (req, res) => {
    try {
        const bookings = await FlightBooking.find({ userId: req.user.id })
            .populate({
                path: 'flightId',
                populate: [{ path: 'airlineId' }, { path: 'fromAirport' }, { path: 'toAirport' }]
            })
            .sort({ createdAt: -1 });
        res.json({ success: true, bookings });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const getBookingByPNR = async (req, res) => {
    try {
        const booking = await FlightBooking.findOne({ pnr: req.params.pnr })
            .populate('userId')
            .populate({
                path: 'flightId',
                populate: [{ path: 'airlineId' }, { path: 'fromAirport' }, { path: 'toAirport' }]
            });
        if (!booking) return res.status(404).json({ success: false, message: 'Ticket not found for PNR: ' + req.params.pnr });
        res.json({ success: true, booking });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const updateBookingStatusByPNR = async (req, res) => {
    try {
        const { bookingStatus, paymentStatus, ticketStatus } = req.body;
        const updates = {};
        if (bookingStatus) updates.bookingStatus = bookingStatus;
        if (paymentStatus) updates.paymentStatus = paymentStatus;
        if (ticketStatus) updates.ticketStatus = ticketStatus;

        const booking = await FlightBooking.findOneAndUpdate(
            { pnr: req.params.pnr },
            updates,
            { new: true }
        );
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
        res.json({ success: true, booking });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const cancelFlightBooking = async (req, res) => {
    try {
        const { bookingId } = req.body;
        
        if (!bookingId) {
            return res.status(400).json({ success: false, message: 'bookingId is required' });
        }

        const booking = await FlightBooking.findOne({ bookingId }).populate('flightId');
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        if (booking.bookingStatus === 'CANCELLED' || booking.cancellationDetails?.isCancelled) {
            return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
        }

        const departureTime = new Date(booking.flightDetails.departureTime);
        const now = new Date();
        const hoursLeft = (departureTime - now) / (1000 * 60 * 60);

        if (hoursLeft < 0) {
            return res.status(400).json({ success: false, message: 'Cannot cancel past flights' });
        }

        const totalFare = booking.fareDetails.totalAmount || 0;
        let refundPercentage = 0;

        if (hoursLeft > 24) {
            refundPercentage = 0.90;
        } else if (hoursLeft >= 12) {
            refundPercentage = 0.70;
        } else if (hoursLeft >= 4) {
            refundPercentage = 0.50;
        } else {
            refundPercentage = 0.00;
        }

        const refundAmount = totalFare * refundPercentage;
        const cancellationCharges = totalFare - refundAmount;

        booking.bookingStatus = 'CANCELLED';
        booking.ticketStatus = 'CANCELLED';
        booking.cancellationDetails = {
            isCancelled: true,
            cancelledAt: new Date(),
            refundAmount,
            cancellationCharges,
            refundStatus: refundAmount > 0 ? 'PROCESSED' : 'NOT_APPLICABLE' // Simulating immediate refund or wallet debit
        };

        // Free up seats in SeatInventory
        const seatNumbers = booking.passengers.map(p => p.seatNumber).filter(Boolean);
        if (seatNumbers.length > 0 && booking.flightId) {
            await SeatInventory.updateMany(
                { flightId: booking.flightId, seatNumber: { $in: seatNumbers } },
                { isBooked: false, isLocked: false, $unset: { bookingId: 1 } }
            );
        }

        await booking.save();

        res.json({
            success: true,
            message: 'Your ticket has been cancelled successfully',
            cancellationDetails: booking.cancellationDetails
        });
    } catch (err) {
        console.error('Cancellation error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = { createFlightBooking, getAllBookings, getBookingById, updateBookingStatus, getUserBookings, getBookingByPNR, updateBookingStatusByPNR, cancelFlightBooking };
