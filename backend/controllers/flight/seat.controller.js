
const SeatInventory = require('../../models/flight/seatInventory.model');
const Flight = require('../../models/flight/flight.model');

/**
 * Get seats for a specific flight
 * Generates seats if they don't exist based on A320 layout
 */
const getFlightSeats = async (req, res) => {
    try {
        const { flightId } = req.query;

        if (!flightId) {
            return res.status(400).json({ success: false, message: 'Flight ID is required' });
        }

        const flight = await Flight.findById(flightId);
        if (!flight) {
            return res.status(404).json({ success: false, message: 'Flight not found' });
        }

        let seats = await SeatInventory.find({ flightId });

        // If no seats found, generate them based on A320 3-3 layout
        if (seats.length === 0) {
            const totalSeats = flight.totalSeats || 180;
            const rows = Math.ceil(totalSeats / 6);
            const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
            
            const newSeats = [];
            const businessRows = 3;

            for (let r = 1; r <= rows; r++) {
                for (let l of letters) {
                    const seatNumber = `${r}${l}`;
                    
                    // Determine type
                    let type = 'Middle';
                    if (l === 'A' || l === 'F') type = 'Window';
                    else if (l === 'C' || l === 'D') type = 'Aisle';

                    // Determine class
                    const isBusiness = r <= businessRows;
                    
                    // Pricing logic
                    let price = 200; // Economy Middle
                    if (isBusiness) price = 800;
                    else if (type === 'Window') price = 400;
                    else if (type === 'Aisle') price = 350;

                    newSeats.push({
                        flightId: flight._id,
                        seatNumber,
                        type,
                        class: isBusiness ? 'Business' : 'Economy',
                        price,
                        isLocked: false,
                        isBooked: false
                    });
                }
            }
            seats = await SeatInventory.insertMany(newSeats);
        }

        res.status(200).json({ success: true, seats });
    } catch (error) {
        console.error("Get Flight Seats Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const lockSeat = async (req, res) => {
    try {
        const { flightId, seatNumber, userId } = req.body;
        const seat = await SeatInventory.findOne({ flightId, seatNumber });

        if (!seat) return res.status(404).json({ success: false, message: 'Seat not found' });
        if (seat.isBooked) return res.status(400).json({ success: false, message: 'Seat already booked' });
        
        // Lock for 5 minutes
        if (seat.isLocked && seat.lockedBy !== userId && seat.lockedAt > new Date(Date.now() - 300000)) {
            return res.status(400).json({ success: false, message: 'Seat is currently locked' });
        }

        seat.isLocked = true;
        seat.lockedAt = new Date();
        seat.lockedBy = userId;
        await seat.save();

        res.json({ success: true, message: 'Seat locked' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const releaseSeat = async (req, res) => {
    try {
        const { flightId, seatNumber, userId } = req.body;
        const seat = await SeatInventory.findOne({ flightId, seatNumber, lockedBy: userId });

        if (seat) {
            seat.isLocked = false;
            seat.lockedAt = null;
            seat.lockedBy = null;
            await seat.save();
        }
        res.json({ success: true, message: 'Seat released' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = {
    getFlightSeats,
    lockSeat,
    releaseSeat
};
