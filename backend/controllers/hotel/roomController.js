const Room = require('../../models/hotel/Room');
const Hotel = require('../../models/hotel/Hotel');
const HotelBooking = require('../../models/hotel/HotelBooking');

const addRoom = async (req, res) => {
    try {
        const roomData = { ...req.body, availableRooms: req.body.totalRooms };
        const room = new Room(roomData);
        await room.save();
        // Auto-update totalRooms count on the parent hotel
        const agg = await Room.aggregate([
            { $match: { hotelId: room.hotelId } },
            { $group: { _id: null, total: { $sum: '$totalRooms' } } }
        ]);
        await Hotel.findByIdAndUpdate(room.hotelId, { totalRooms: agg[0]?.total || 0 });
        res.status(201).json({ success: true, room });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const getRoomsByHotel = async (req, res) => {
    try {
        const rooms = await Room.find({ hotelId: req.params.hotelId }).populate('hotelId', 'hotelName city');
        res.json({ success: true, rooms });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find().populate('hotelId', 'hotelName city status').sort({ createdAt: -1 });
        res.json({ success: true, rooms });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const updateRoom = async (req, res) => {
    try {
        const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
        res.json({ success: true, room });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const deleteRoom = async (req, res) => {
    try {
        const room = await Room.findByIdAndDelete(req.params.id);
        if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
        res.json({ success: true, message: 'Room deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const updateRoomAvailability = async (req, res) => {
    try {
        const { roomId, decreaseBy } = req.body;
        if (!roomId || decreaseBy === undefined) {
            return res.status(400).json({ success: false, message: 'roomId and decreaseBy required' });
        }

        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

        const newAvailability = room.availableRooms - decreaseBy;
        if (newAvailability < 0) {
            return res.status(400).json({ success: false, message: 'Insufficient rooms available' });
        }

        room.availableRooms = newAvailability;
        if (newAvailability === 0) {
            room.status = 'Sold Out';
        } else if (room.status === 'Sold Out' && newAvailability > 0) {
            room.status = 'available';
        }

        await room.save();
        res.json({ success: true, availableRooms: room.availableRooms, status: room.status });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const getRoomAvailability = async (req, res) => {
    try {
        const { roomId } = req.query;
        if (!roomId) return res.status(400).json({ success: false, message: 'roomId required' });

        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

        const confirmedBookings = await HotelBooking.countDocuments({
            roomId,
            status: 'confirmed'
        });

        const available = Math.max(0, room.totalRooms - confirmedBookings);
        
        res.json({
            success: true,
            roomId,
            totalRooms: room.totalRooms,
            bookedRooms: confirmedBookings,
            availableRooms: available
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = { addRoom, getRoomsByHotel, getAllRooms, updateRoom, deleteRoom, updateRoomAvailability, getRoomAvailability };
