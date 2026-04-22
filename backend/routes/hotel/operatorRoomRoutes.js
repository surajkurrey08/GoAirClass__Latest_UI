const express = require('express');
const router = express.Router();
const Room = require('../../models/hotel/Room');
const Hotel = require('../../models/hotel/Hotel');
const RoomInventory = require('../../models/hotel/RoomInventory');
const { verifyHotelOperator } = require('../../middleware/hotelOperatorAuth');

router.use(verifyHotelOperator);

const HotelBooking = require('../../models/hotel/HotelBooking');

// GET /api/hotel-operator/rooms/inventory — full inventory list for operator
router.get('/inventory', async (req, res) => {
    try {
        const hotels = await Hotel.find({ operatorId: req.hotelOperator._id }, '_id');
        const hotelIds = hotels.map(h => h._id);
        const inventory = await RoomInventory.find({ hotelId: { $in: hotelIds } })
            .populate('hotelId', 'hotelName')
            .populate('roomTypeId', 'roomType')
            .lean()
            .sort({ roomNumber: 1 });

        // Augment with current booking info and dynamic status
        const augmentedInventory = await Promise.all(inventory.map(async (item) => {
            // Find all active bookings for this specific room unit
            const bookings = await HotelBooking.find({ 
                inventoryRoomId: item._id,
                status: { $in: ['confirmed', 'pending'] }
            })
            .sort({ createdAt: -1 })
            .select('guestName guestPhone bookingId checkInDate checkOutDate status');
            
            // Check if any booking includes "today"
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Zero out time for date-only comparison

            const currentBooking = bookings.find(b => {
                const start = new Date(b.checkInDate);
                const end = new Date(b.checkOutDate);
                start.setHours(0, 0, 0, 0);
                end.setHours(0, 0, 0, 0);
                return today >= start && today <= end;
            });

            if (currentBooking) {
                return { ...item, status: 'booked', currentBooking };
            }
            return { ...item, status: item.status || 'available' };
        }));

        res.json({ success: true, inventory: augmentedInventory });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/hotel-operator/rooms — all rooms of this operator's hotels
router.get('/', async (req, res) => {
    try {
        const hotels = await Hotel.find({ operatorId: req.hotelOperator._id }, '_id');
        const hotelIds = hotels.map(h => h._id);
        const rooms = await Room.find({ hotelId: { $in: hotelIds } }).populate('hotelId', 'hotelName city');
        res.json({ success: true, rooms });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/hotel-operator/rooms/my-hotels — dropdown list of operator hotels
router.get('/my-hotels', async (req, res) => {
    try {
        const hotels = await Hotel.find({ operatorId: req.hotelOperator._id }, 'hotelName city status');
        res.json({ success: true, hotels });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/hotel-operator/rooms/:id — get one room
router.get('/:id', async (req, res) => {
    try {
        const room = await Room.findById(req.params.id).populate('hotelId');
        if (!room) return res.status(404).json({ error: 'Room not found.' });

        // Verify ownership
        const hotel = await Hotel.findOne({ _id: room.hotelId._id, operatorId: req.hotelOperator._id });
        if (!hotel) return res.status(403).json({ error: 'Access denied.' });

        res.json({ success: true, room });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/hotel-operator/rooms — add room
router.post('/', async (req, res) => {
    try {
        const { hotelId, roomType, pricePerNight, capacity, totalRooms, amenities, images, status } = req.body;

        // Verify hotel belongs to this operator
        const hotel = await Hotel.findOne({ _id: hotelId, operatorId: req.hotelOperator._id });
        if (!hotel) return res.status(403).json({ error: 'Hotel not found or access denied.' });

        // Map pricePerNight → price (model field name)
        const price = Number(pricePerNight) || 0;

        // Normalise status
        const normStatus = status ? status.toLowerCase() : 'available';
        const validStatus = ['available', 'unavailable'].includes(normStatus) ? normStatus : 'available';

        // Validate roomType
        const validRoomTypes = ['Standard', 'Deluxe', 'Suite', 'Executive', 'Family', 'Single', 'Double'];
        const safeRoomType = validRoomTypes.includes(roomType) ? roomType : 'Standard';

        const roomCount = Number(totalRooms) || 1;

        const room = await Room.create({
            hotelId,
            roomType: safeRoomType,
            price,
            capacity: Number(capacity) || 2,
            totalRooms: roomCount,
            amenities: amenities || [],
            images: images || [],
            status: validStatus,
        });

        // ── AUTO-GENERATE ROOM INVENTORY ─────────────────────────────────────
        // Prefix logic: 'FR' for Family Room, 'ST' for Standard, etc.
        const typePrefixes = {
            'Family': 'FR',
            'Standard': 'ST',
            'Deluxe': 'DX',
            'Suite': 'SU',
            'Executive': 'EX',
            'Single': 'SI',
            'Double': 'DO'
        };
        const prefix = typePrefixes[safeRoomType] || 'RM';
        
        const inventoryData = [];
        for (let i = 1; i <= roomCount; i++) {
            // e.g. FR-101, FR-102...
            const roomNumber = `${prefix}-${100 + i}`;
            inventoryData.push({
                hotelId,
                roomTypeId: room._id,
                roomNumber,
                status: 'available'
            });
        }
        await RoomInventory.insertMany(inventoryData);

        // Update hotel totalRooms count
        const totalCount = await Room.aggregate([
            { $match: { hotelId: hotel._id } },
            { $group: { _id: null, total: { $sum: '$totalRooms' } } }
        ]);
        hotel.totalRooms = totalCount[0]?.total || 0;
        await hotel.save();

        res.status(201).json({ success: true, room, message: `${roomCount} rooms generated.` });
    } catch (err) { res.status(500).json({ error: err.message }); }
});


// PUT /api/hotel-operator/rooms/:id — update room
router.put('/:id', async (req, res) => {
    try {
        const room = await Room.findById(req.params.id).populate('hotelId');
        if (!room) return res.status(404).json({ error: 'Room not found.' });

        // Verify ownership
        const hotel = await Hotel.findOne({ _id: room.hotelId._id, operatorId: req.hotelOperator._id });
        if (!hotel) return res.status(403).json({ error: 'Access denied.' });

        const prevTotalRooms = Number(room.totalRooms) || 0;
        const newTotalRooms = req.body.totalRooms !== undefined ? Number(req.body.totalRooms) : prevTotalRooms;

        // Update basic fields
        const allowed = ['roomType', 'capacity', 'bedType', 'amenities', 'status', 'size', 'view', 'originalPrice', 'discountPrice'];
        allowed.forEach(f => { if (req.body[f] !== undefined) room[f] = req.body[f]; });

        // Specific mappings
        if (req.body.pricePerNight !== undefined) room.price = Number(req.body.pricePerNight);
        if (req.body.totalRooms !== undefined) room.totalRooms = newTotalRooms;

        await room.save();

        // ── SYNC INVENTORY IF QUANTITY INCREASED ─────────────────────────────
        if (newTotalRooms > prevTotalRooms) {
            const diff = newTotalRooms - prevTotalRooms;
            const typePrefixes = {
                'Family': 'FR', 'Standard': 'ST', 'Deluxe': 'DX', 'Suite': 'SU', 'Executive': 'EX', 'Single': 'SI', 'Double': 'DO'
            };
            const prefix = typePrefixes[room.roomType] || 'RM';
            
            const inventoryData = [];
            for (let i = 1; i <= diff; i++) {
                // Room Numbers follow 100 + current_count pattern
                const roomNo = 100 + prevTotalRooms + i;
                const roomNumber = `${prefix}-${roomNo}`;
                inventoryData.push({
                    hotelId: hotel._id,
                    roomTypeId: room._id,
                    roomNumber,
                    status: 'available'
                });
            }
            await RoomInventory.insertMany(inventoryData);
        }

        // ── RECALCULATE HOTEL GLOBAL COUNT ───────────────────────────────────
        const totalCount = await Room.aggregate([
            { $match: { hotelId: hotel._id } },
            { $group: { _id: null, total: { $sum: '$totalRooms' } } }
        ]);
        hotel.totalRooms = totalCount[0]?.total || 0;
        await hotel.save();

        res.json({ success: true, room, message: `Room updated to ${newTotalRooms} total. ${newTotalRooms > prevTotalRooms ? (newTotalRooms - prevTotalRooms) + ' new units added.' : ''}` });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/hotel-operator/rooms/update-price — bulk price update
router.put('/update-price', async (req, res) => {
    try {
        const { updates } = req.body; // [{ roomId, newPrice }]
        if (!Array.isArray(updates)) return res.status(400).json({ error: 'updates must be an array.' });

        const results = [];
        for (const { roomId, newPrice } of updates) {
            const room = await Room.findById(roomId).populate('hotelId');
            if (!room) continue;
            const hotel = await Hotel.findOne({ _id: room.hotelId._id, operatorId: req.hotelOperator._id });
            if (!hotel) continue;
            room.price = Number(newPrice); // Corrected from pricePerNight
            await room.save();
            results.push({ roomId, newPrice });
        }
        res.json({ success: true, updated: results.length, results });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/hotel-operator/rooms/:id
router.delete('/:id', async (req, res) => {
    try {
        const room = await Room.findById(req.params.id).populate('hotelId');
        if (!room) return res.status(404).json({ error: 'Room not found.' });

        const hotel = await Hotel.findOne({ _id: room.hotelId._id, operatorId: req.hotelOperator._id });
        if (!hotel) return res.status(403).json({ error: 'Access denied.' });

        await room.deleteOne();
        res.json({ success: true, message: 'Room deleted.' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
