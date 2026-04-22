const Airport = require('../../models/flight/airport.model');

const createAirport = async (req, res) => {
    try {
        const airport = new Airport(req.body);
        await airport.save();
        res.status(201).json({ success: true, airport });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const getAirports = async (req, res) => {
    try {
        const airports = await Airport.find().sort({ createdAt: -1 });
        res.json({ success: true, airports });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const getAirportById = async (req, res) => {
    try {
        const airport = await Airport.findById(req.params.id);
        if (!airport) return res.status(404).json({ success: false, message: 'Airport not found' });
        res.json({ success: true, airport });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const updateAirport = async (req, res) => {
    try {
        const airport = await Airport.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!airport) return res.status(404).json({ success: false, message: 'Airport not found' });
        res.json({ success: true, airport });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const deleteAirport = async (req, res) => {
    try {
        await Airport.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Airport deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = { createAirport, getAirports, getAirportById, updateAirport, deleteAirport };
