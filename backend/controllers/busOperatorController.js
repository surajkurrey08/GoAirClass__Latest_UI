const Booking = require('../models/Booking');
const Bus = require('../models/Bus');
const Schedule = require('../models/Schedule');

/**
 * Get all live/upcoming bookings for the operator
 */
const getLiveBookings = async (req, res) => {
    try {
        const operatorId = req.user.id; // From authMiddleware (Operator ID)

        // Find all buses for this operator
        const buses = await Bus.find({ operator: operatorId });
        const busIds = buses.map(bus => bus._id);

        // Find bookings for these buses
        // We populate bus, route and schedule for details
        const bookings = await Booking.find({ bus: { $in: busIds } })
            .populate('bus')
            .populate('route')
            .populate('schedule')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, bookings });
    } catch (error) {
        console.error("Get Live Bookings Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

/**
 * Update boarding status
 */
const updateBoardingStatus = async (req, res) => {
    try {
        const { bookingId, boardingStatus, operatorNotes } = req.body;
        const operatorId = req.user.id;

        const booking = await Booking.findById(bookingId).populate('bus');
        if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

        // Prevent duplicate status updates
        if (booking.boardingStatus === boardingStatus) {
            return res.status(400).json({ success: false, message: `Passenger is already marked as ${boardingStatus}` });
        }

        // Security check: Ensure this booking belongs to this operator
        if (booking.bus.operator.toString() !== operatorId) {
            return res.status(403).json({ success: false, message: "Unauthorized access to this booking" });
        }

        if (boardingStatus) booking.boardingStatus = boardingStatus;
        if (operatorNotes !== undefined) booking.operatorNotes = operatorNotes;

        await booking.save();

        res.status(200).json({ success: true, message: "Status updated successfully", booking });
    } catch (error) {
        console.error("Update Boarding Status Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

/**
 * Change seat assignment
 */
const changeSeat = async (req, res) => {
    try {
        const { bookingId, newSeatNumbers } = req.body;
        const operatorId = req.user.id;

        const booking = await Booking.findById(bookingId).populate('bus');
        if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

        if (booking.bus.operator.toString() !== operatorId) {
            return res.status(403).json({ success: false, message: "Unauthorized access" });
        }

        // Logic to check seat availability could be added here
        // For now, we update the seats
        booking.seatNumbers = newSeatNumbers;
        await booking.save();

        res.status(200).json({ success: true, message: "Seats updated successfully", booking });
    } catch (error) {
        console.error("Change Seat Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

/**
 * Cancel booking by operator
 */
const cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.body;
        const operatorId = req.user.id;

        const booking = await Booking.findById(bookingId).populate('bus');
        if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

        if (booking.bus.operator.toString() !== operatorId) {
            return res.status(403).json({ success: false, message: "Unauthorized access" });
        }

        booking.status = 'Cancelled';
        booking.paymentStatus = 'Cancelled';
        await booking.save();

        res.status(200).json({ success: true, message: "Booking cancelled successfully" });
    } catch (error) {
        console.error("Cancel Booking Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

module.exports = {
    getLiveBookings,
    updateBoardingStatus,
    changeSeat,
    cancelBooking
};
