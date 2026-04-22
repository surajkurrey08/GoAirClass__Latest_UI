const FlightOffer = require('../../models/flight/flightOffer.model');

const createOffer = async (req, res) => {
    try {
        const offer = new FlightOffer(req.body);
        await offer.save();
        res.status(201).json({ success: true, offer });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const getOffers = async (req, res) => {
    try {
        const offers = await FlightOffer.find().sort({ createdAt: -1 });
        res.json({ success: true, offers });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const updateOffer = async (req, res) => {
    try {
        const offer = await FlightOffer.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });
        res.json({ success: true, offer });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const deleteOffer = async (req, res) => {
    try {
        await FlightOffer.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Offer deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = { createOffer, getOffers, updateOffer, deleteOffer };
