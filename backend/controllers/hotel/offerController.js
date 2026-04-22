const HotelOffer = require('../../models/hotel/HotelOffer');

const createOffer = async (req, res) => {
    try {
        const offer = new HotelOffer(req.body);
        await offer.save();
        res.status(201).json({ success: true, offer });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const getAllOffers = async (req, res) => {
    try {
        const offers = await HotelOffer.find().populate('hotelId', 'hotelName city').sort({ createdAt: -1 });
        res.json({ success: true, offers });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const updateOffer = async (req, res) => {
    try {
        const offer = await HotelOffer.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });
        res.json({ success: true, offer });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const deleteOffer = async (req, res) => {
    try {
        await HotelOffer.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Offer deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = { createOffer, getAllOffers, updateOffer, deleteOffer };
