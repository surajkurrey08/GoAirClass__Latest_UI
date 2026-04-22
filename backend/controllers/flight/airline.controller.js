const Airline = require('../../models/flight/airline.model');

const createAirline = async (req, res) => {
    try {
        const airline = new Airline(req.body);
        await airline.save();
        res.status(201).json({ success: true, airline });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const getAirlines = async (req, res) => {
    try {
        const airlines = await Airline.find().sort({ createdAt: -1 });
        res.json({ success: true, airlines });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const updateAirline = async (req, res) => {
    try {
        const airline = await Airline.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!airline) return res.status(404).json({ success: false, message: 'Airline not found' });
        res.json({ success: true, airline });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const deleteAirline = async (req, res) => {
    try {
        await Airline.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Airline deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = { createAirline, getAirlines, updateAirline, deleteAirline };
