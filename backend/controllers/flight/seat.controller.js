const SeatInventory = require('../../models/flight/seatInventory.model');

const getFlightSeats = async (req, res) => {
    try {
        const { flightId } = req.params;
        let seats = await SeatInventory.find({ flightId });

        // If no seats exist for this flight yet, generate default map (Rows 1-30, A-F)
        if (seats.length === 0) {
            const newSeats = [];
            for (let row = 1; row <= 30; row++) {
                ['A', 'B', 'C', 'D', 'E', 'F'].forEach(col => {
                    let type = 'Standard';
                    let price = 390;
                    if (row <= 3) {
                        type = 'Premium';
                        price = 950;
                    } else if (row >= 4 && row <= 6) {
                        type = 'Extra Legroom';
                        price = 650;
                    } else if (row > 25) {
                        type = 'Free';
                        price = 0;
                    }
                    newSeats.push({
                        flightId,
                        seatNumber: `${row}${col}`,
                        type,
                        price
                    });
                });
            }
            seats = await SeatInventory.insertMany(newSeats);
        }

        res.json({ success: true, seats });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const lockSeat = async (req, res) => {
    try {
        const { flightId, seatNumber, userId } = req.body;
        console.log(`[SeatLock] Attempting to lock seat ${seatNumber} for flight ${flightId} by user ${userId}`);

        const seat = await SeatInventory.findOne({ flightId, seatNumber });

        if (!seat) {
            console.error(`[SeatLock] Seat ${seatNumber} not found for flight ${flightId}`);
            return res.status(404).json({ success: false, message: 'Seat not found' });
        }

        if (seat.isBooked) {
            return res.status(400).json({ success: false, message: 'Seat already booked' });
        }

        // If seat is locked by someone else and hasn't expired (5 mins)
        if (seat.isLocked && seat.lockedBy !== userId && seat.lockedAt > new Date(Date.now() - 300000)) {
            return res.status(400).json({ success: false, message: 'Seat is currently locked by another user' });
        }

        seat.isLocked = true;
        seat.lockedAt = new Date();
        seat.lockedBy = userId;
        await seat.save();

        console.log(`[SeatLock] Successfully locked seat ${seatNumber}`);
        res.json({ success: true, message: 'Seat locked for 5 minutes' });
    } catch (err) {
        console.error(`[SeatLock] Error:`, err.message);
        res.status(500).json({ success: false, error: err.message });
    }
};

const releaseSeat = async (req, res) => {
    try {
        const { flightId, seatNumber, userId } = req.body;
        console.log(`[SeatRelease] Releasing seat ${seatNumber} for flight ${flightId} by user ${userId}`);

        const seat = await SeatInventory.findOne({ flightId, seatNumber, lockedBy: userId });

        if (seat) {
            seat.isLocked = false;
            seat.lockedAt = null;
            seat.lockedBy = null;
            await seat.save();
            console.log(`[SeatRelease] Successfully released seat ${seatNumber}`);
        }

        res.json({ success: true, message: 'Seat released' });
    } catch (err) {
        console.error(`[SeatRelease] Error:`, err.message);
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = {
    getFlightSeats,
    lockSeat,
    releaseSeat
};
