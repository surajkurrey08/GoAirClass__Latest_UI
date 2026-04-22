const FlightBooking = require('../../models/flight/flightBooking.model');

const getAllPassengers = async (req, res) => {
    try {
        const bookings = await FlightBooking.find()
            .populate('flightId', 'flightNumber')
            .lean();

        const allPassengers = [];
        bookings.forEach(booking => {
            if (booking.passengers && Array.isArray(booking.passengers)) {
                booking.passengers.forEach(p => {
                    // Calculate age from DOB if possible
                    let age = '—';
                    if (p.dateOfBirth) {
                        const birthDate = new Date(p.dateOfBirth);
                        const today = new Date();
                        age = today.getFullYear() - birthDate.getFullYear();
                        const m = today.getMonth() - birthDate.getMonth();
                        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                            age--;
                        }
                    }

                    allPassengers.push({
                        _id: p._id || `${booking._id}-${p.seatNumber}`,
                        name: `${p.firstName} ${p.lastName}`,
                        age: age,
                        gender: p.gender,
                        seatNumber: p.seatNumber,
                        flightId: booking.flightId, 
                        bookingId: { _id: booking._id } 
                    });
                });
            }
        });

        res.json({ success: true, passengers: allPassengers });
    } catch (err) {
        console.error('getAllPassengers error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

const getPassengersByBooking = async (req, res) => {
    try {
        const booking = await FlightBooking.findById(req.params.bookingId)
            .populate('flightId', 'flightNumber')
            .lean();
            
        if (!booking) return res.status(404).json({ success: true, passengers: [] });

        const passengers = (booking.passengers || []).map(p => {
            let age = '—';
            if (p.dateOfBirth) {
                const birthDate = new Date(p.dateOfBirth);
                const today = new Date();
                age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
            }

            return {
                _id: p._id || `${booking._id}-${p.seatNumber}`,
                name: `${p.firstName} ${p.lastName}`,
                age,
                gender: p.gender,
                seatNumber: p.seatNumber,
                flightId: booking.flightId,
                bookingId: { _id: booking._id }
            };
        });

        res.json({ success: true, passengers });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const createPassenger = async (req, res) => {
    res.status(400).json({ success: false, message: "Passengers are now managed within bookings." });
};

module.exports = { getAllPassengers, getPassengersByBooking, createPassenger };
