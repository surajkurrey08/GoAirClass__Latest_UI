const Bus = require('../models/Bus');
const Hotel = require('../models/hotel/Hotel');
const Room = require('../models/hotel/Room');

const getAssets = async (req, res) => {
    try {
        const { type } = req.query;

        if (type === 'BUS') {
            const buses = await Bus.find().populate('operator', 'name');
            const normalized = buses.map(b => ({
                id: b._id,
                name: b.busName,
                subtitle: `${b.busType}`, // Simplified for now, or fetch route
                price: b.seatLayout?.[0]?.price || 500,
                type: 'BUS',
                operatorId: b.operator?._id || '',
                operatorName: b.operator?.name || 'Unknown'
            }));
            return res.json({ success: true, assets: normalized });
        }

        if (type === 'HOTEL') {
            const hotels = await Hotel.find();

            // For each hotel, we need its min price from the Room model
            const assetsWithPrice = await Promise.all(hotels.map(async (h) => {
                const minRoom = await Room.findOne({ hotelId: h._id }).sort({ price: 1 });
                return {
                    id: h._id,
                    name: h.hotelName,
                    subtitle: h.city,
                    price: minRoom?.price || 2000,
                    type: 'HOTEL',
                    starRating: h.starRating,
                    operatorId: h.operatorId || '',
                    operatorName: h.operatorName || 'N/A'
                };
            }));

            return res.json({ success: true, assets: assetsWithPrice });
        }

        res.status(400).json({ success: false, message: 'Invalid asset type' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = { getAssets };
