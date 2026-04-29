
const FlightBaggageMapping = require('../../models/flight/flightBaggageMapping.model');

exports.saveBaggageMapping = async (req, res) => {
    try {
        const { flightId } = req.params;
        const mapping = await FlightBaggageMapping.findOneAndUpdate(
            { flightId },
            { ...req.body, flightId },
            { upsert: true, new: true }
        );
        res.json({ success: true, mapping });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getBaggageMapping = async (req, res) => {
    try {
        const mapping = await FlightBaggageMapping.findOne({ flightId: req.params.flightId });
        res.json({ success: true, mapping });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
