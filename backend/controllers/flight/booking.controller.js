const BookingSession = require('../../models/flight/bookingSession.model');
const PriceLock = require('../../models/flight/priceLock.model');
const Flight = require('../../models/flight/flight.model');
const crypto = require('crypto');
const dayjs = require('dayjs');

// 1. Create Booking Session
exports.createBookingSession = async (req, res) => {
    try {
        const { flightId, searchData } = req.body;

        const flight = await Flight.findById(flightId)
            .populate('airlineId')
            .populate('fromAirport')
            .populate('toAirport');

        if (!flight) {
            return res.status(404).json({ success: false, message: "Flight not found" });
        }

        // Generate fareKey: {FROM}-{TO}-{FLIGHTNO}-{DATE}-{HASH}
        const fromCode = flight.fromAirport?.airportCode || flight.fromAirport?.iataCode || 'UNK';
        const toCode = flight.toAirport?.airportCode || flight.toAirport?.iataCode || 'UNK';
        const dateStr = dayjs(flight.departureTime).format('DDMMYYYY');
        const hash = crypto.randomBytes(3).toString('hex').toUpperCase();
        const fareKey = `${fromCode}-${toCode}-${flight.flightNumber}-${dateStr}-${hash}`;

        // Generate sessionId
        const sessionId = crypto.randomUUID();

        // Price snapshot
        const priceSnapshot = {
            baseFare: flight.price * 0.85,
            taxes: flight.price * 0.15,
            total: flight.price,
            currency: 'INR'
        };

        const session = new BookingSession({
            sessionId,
            fareKey,
            flightId,
            priceSnapshot,
            searchData,
            expiresAt: dayjs().add(15, 'minute').toDate(),
            status: 'ACTIVE'
        });

        await session.save();

        res.status(201).json({
            success: true,
            sessionId,
            fareKey,
            priceSnapshot
        });
    } catch (err) {
        console.error("Create Session Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// 2. Lock Price
exports.lockPrice = async (req, res) => {
    try {
        const { sessionId } = req.body;

        const session = await BookingSession.findOne({ sessionId, status: 'ACTIVE' });
        if (!session) {
            return res.status(400).json({ success: false, message: "Session expired or invalid" });
        }

        const existingLock = await PriceLock.findOne({ sessionId });
        if (existingLock) {
            return res.status(400).json({ success: false, message: "Price already locked for this session" });
        }

        const priceLock = new PriceLock({
            sessionId,
            userId: req.user?._id, // If user is logged in
            lockedPrice: session.priceSnapshot.total,
            lockFee: 249,
            expiresAt: dayjs().add(24, 'hour').toDate(),
            status: 'LOCKED'
        });

        await priceLock.save();

        res.json({
            success: true,
            message: "Price locked for 24 hours",
            lockedPrice: priceLock.lockedPrice,
            expiresAt: priceLock.expiresAt
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// 3. Get Session Details
exports.getSessionDetails = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await BookingSession.findOne({ sessionId }).populate('flightId');
        
        if (!session) {
            return res.status(404).json({ success: false, message: "Session not found" });
        }

        if (dayjs().isAfter(session.expiresAt)) {
            session.status = 'EXPIRED';
            await session.save();
            return res.status(410).json({ success: false, message: "Session expired" });
        }

        res.json({ success: true, session });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const FlightBooking = require('../../models/flight/flightBooking.model');

// 4. Create Final Booking (PENDING state)
exports.createBooking = async (req, res) => {
    try {
        const { sessionId, travellers, contactInfo, selectedSeats, selectedMeals, fareDetails } = req.body;
        console.log('Incoming Booking Data:', {
            sessionId,
            travellersCount: travellers?.length,
            seatsSelected: selectedSeats?.length,
            mealsSelected: selectedMeals?.length,
            meals: selectedMeals
        });

        const session = await BookingSession.findOne({ sessionId }).populate({
            path: 'flightId',
            populate: [
                { path: 'airlineId' },
                { path: 'fromAirport' },
                { path: 'toAirport' }
            ]
        });
        if (!session) {
            return res.status(404).json({ success: false, message: "Booking session not found" });
        }

        const flight = session.flightId;
        console.log('Creating booking for flight:', flight._id);

        // Generate a unique booking ID
        const bookingId = `BK-${Date.now()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

        const newBooking = new FlightBooking({
            userId: req.user?._id || req.user?.id || null,
            flightId: flight._id,
            flightDetails: {
                airline: flight.airlineId?.name || flight.airlineName || 'Airline',
                flightNumber: flight.flightNumber,
                departureAirport: flight.fromAirport?.name || flight.fromAirport?.airportName || flight.from,
                arrivalAirport: flight.toAirport?.name || flight.toAirport?.airportName || flight.to,
                departureCity: flight.fromAirport?.city || flight.from,
                arrivalCity: flight.toAirport?.city || flight.to,
                departureTime: flight.departureTime,
                durationMinutes: flight.durationMinutes || 140,
                aircraft: flight.aircraftType || 'Airbus A320',
                terminal: flight.departureTerminal || 'T3',
            },
            passengers: travellers.map((t, idx) => {
                const seat = (selectedSeats || []).find(s => (s.travellerIdx === idx || s.passengerIdx === idx));
                const meal = (selectedMeals || []).find(m => (m.travellerIdx === idx || m.passengerIdx === idx));
                return {
                    firstName: t.firstName || 'Passenger',
                    lastName: t.lastName || (idx + 1).toString(),
                    gender: (t.title === 'Mr' || t.title === 'Master') ? 'Male' : 'Female',
                    dateOfBirth: t.dob || new Date(),
                    nationality: t.nationality || 'Indian',
                    seatNumber: seat?.seatNumber || 'Auto',
                    seatType: seat?.type || 'Economy',
                    seatPrice: seat?.price || 0,
                    baggage: flight.baggageInfo?.checkIn || '15kg',
                    meal: meal?.mealCode || 'Standard'
                };
            }),
            contactDetails: {
                email: contactInfo.email,
                phone: contactInfo.phone?.startsWith('+') ? contactInfo.phone : `+91${contactInfo.phone}`
            },
            fareDetails: {
                baseFare: fareDetails.baseFare || 0,
                taxes: fareDetails.taxes || 0,
                seatFee: fareDetails.seatFee || 0,
                addons: fareDetails.addons || 0,
                totalAmount: fareDetails.totalAmount || 0
            },
            bookingId,
            paymentStatus: 'PENDING',
            bookingStatus: 'PENDING'
        });

        await newBooking.save();

        res.status(201).json({
            success: true,
            bookingId: newBooking.bookingId,
            id: newBooking._id,
            message: "Booking created in pending state"
        });
    } catch (err) {
        console.error("❌ Create Booking Error:", err.message);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            console.error("❌ Validation Details:", messages);
            return res.status(400).json({ success: false, message: "Validation failed", details: messages });
        }
        res.status(500).json({ success: false, error: err.message });
    }
};

// 5. Get Booking Details
exports.getBookingDetails = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await FlightBooking.findOne({ bookingId }).populate({
            path: 'flightId',
            populate: [
                { path: 'airlineId' },
                { path: 'fromAirport' },
                { path: 'toAirport' }
            ]
        });

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        res.json({ success: true, booking });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// 6. Get Booking by PNR
exports.getBookingByPNR = async (req, res) => {
    try {
        const { pnr } = req.params;
        const booking = await FlightBooking.findOne({ pnr }).populate({
            path: 'flightId',
            populate: [
                { path: 'airlineId' },
                { path: 'fromAirport' },
                { path: 'toAirport' }
            ]
        });

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        res.json({ success: true, booking });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// 7. Get User Bookings
exports.getUserBookings = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const bookings = await FlightBooking.find({ userId })
            .sort({ createdAt: -1 })
            .populate({
                path: 'flightId',
                populate: [
                    { path: 'airlineId' },
                    { path: 'fromAirport' },
                    { path: 'toAirport' }
                ]
            });
        res.json({ success: true, bookings });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
