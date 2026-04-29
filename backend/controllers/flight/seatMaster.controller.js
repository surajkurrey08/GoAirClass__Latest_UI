
const SeatMaster = require('../../models/flight/seatMaster.model');
const FlightSeatMapping = require('../../models/flight/flightSeatMapping.model');

exports.createSeatMaster = async (req, res) => {
    try {
        const seatMaster = new SeatMaster(req.body);
        await seatMaster.save();
        res.status(201).json({ success: true, seatMaster });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getSeatMasters = async (req, res) => {
    try {
        const masters = await SeatMaster.find().sort({ aircraftType: 1 });
        res.json({ success: true, masters });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.updateSeatMaster = async (req, res) => {
    try {
        const seatMaster = await SeatMaster.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, seatMaster });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.deleteSeatMaster = async (req, res) => {
    try {
        await SeatMaster.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Seat configuration removed" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * Flight Specific Mapping
 */
exports.saveFlightSeatMapping = async (req, res) => {
    try {
        const { flightId } = req.params;
        const mapping = await FlightSeatMapping.findOneAndUpdate(
            { flightId },
            { ...req.body, flightId },
            { upsert: true, new: true }
        );
        res.json({ success: true, mapping });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getFlightSeatMapping = async (req, res) => {
    try {
        const mapping = await FlightSeatMapping.findOne({ flightId: req.params.flightId });
        res.json({ success: true, mapping });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
