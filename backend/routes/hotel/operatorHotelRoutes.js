const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Hotel = require('../../models/hotel/Hotel');
const { verifyHotelOperator } = require('../../middleware/hotelOperatorAuth');

// ── Multer setup for hotel images ──────────────────────────────────────────
const hotelUploadsDir = path.join(__dirname, '../../uploads/hotels');
if (!fs.existsSync(hotelUploadsDir)) fs.mkdirSync(hotelUploadsDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, hotelUploadsDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`),
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per file
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (allowed.includes(file.mimetype)) cb(null, true);
        else cb(new Error('Only JPG, PNG and WEBP images are allowed.'));
    },
});

// All routes require hotel operator auth
router.use(verifyHotelOperator);

// GET /api/hotel-operator/hotels — operator's own hotels
router.get('/', async (req, res) => {
    try {
        const hotels = await Hotel.find({ operatorId: req.hotelOperator._id }).sort({ createdAt: -1 });
        res.json({ success: true, hotels });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/hotel-operator/hotels — add new hotel (status = pending)
// Accepts multipart/form-data with optional 'images' file fields
router.post('/', upload.array('images', 10), async (req, res) => {
    try {
        const { hotelName, city, address, description, starRating, latitude, longitude } = req.body;
        
        // amenities may arrive as a JSON string from FormData
        let amenities = [];
        if (req.body.amenities) {
            try { amenities = JSON.parse(req.body.amenities); }
            catch { amenities = req.body.amenities.split(',').map(a => a.trim()).filter(Boolean); }
        }

        if (!hotelName || !city || !address)
            return res.status(400).json({ error: 'Hotel name, city and address are required.' });

        // Build image path array from uploaded files
        const imagePaths = req.files ? req.files.map(f => `/uploads/hotels/${f.filename}`) : [];

        const hotel = await Hotel.create({
            hotelName, city, address,
            description: description || '',
            amenities,
            images: imagePaths,
            starRating: starRating ? Number(starRating) : 3,
            latitude: latitude ? Number(latitude) : undefined,
            longitude: longitude ? Number(longitude) : undefined,
            operatorId: req.hotelOperator._id,
            operatorName: req.hotelOperator.name,
            status: 'pending',
        });

        res.status(201).json({
            success: true,
            message: 'Hotel submitted for admin approval.',
            hotel,
            images: imagePaths,
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/hotel-operator/hotels/:id — get one hotel
router.get('/:id', async (req, res) => {
    try {
        const hotel = await Hotel.findOne({ _id: req.params.id, operatorId: req.hotelOperator._id });
        if (!hotel) return res.status(404).json({ error: 'Hotel not found or access denied.' });
        res.json({ success: true, hotel });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/hotel-operator/hotels/:id — edit own hotel
router.put('/:id', upload.array('images', 10), async (req, res) => {
    try {
        const hotel = await Hotel.findOne({ _id: req.params.id, operatorId: req.hotelOperator._id });
        if (!hotel) return res.status(404).json({ error: 'Hotel not found or access denied.' });

        // Update basic fields
        const allowed = ['hotelName', 'city', 'address', 'description', 'starRating', 'latitude', 'longitude'];
        allowed.forEach(f => {
            if (req.body[f] !== undefined) {
                hotel[f] = (f === 'starRating' || f === 'latitude' || f === 'longitude') ? Number(req.body[f]) : req.body[f];
            }
        });

        // Handle amenities (JSON string from FormData)
        if (req.body.amenities) {
            try { hotel.amenities = JSON.parse(req.body.amenities); }
            catch { hotel.amenities = req.body.amenities.split(',').map(a => a.trim()).filter(Boolean); }
        }

        // Handle Images: Merge existing ones with new ones
        let finalImages = [];
        if (req.body.existingImages) {
            try { finalImages = JSON.parse(req.body.existingImages); }
            catch { finalImages = []; }
        } else {
            // If not provided, we assume they want to keep original ones IF no new ones added?
            // Actually, the frontend should always send the list to keep.
            finalImages = hotel.images || [];
        }

        const newImagePaths = req.files ? req.files.map(f => `/uploads/hotels/${f.filename}`) : [];
        hotel.images = [...finalImages, ...newImagePaths];

        hotel.status = 'pending'; // reset to pending after edit
        await hotel.save();

        res.json({ success: true, hotel });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/hotel-operator/hotels/:id
router.delete('/:id', async (req, res) => {
    try {
        const hotel = await Hotel.findOneAndDelete({ _id: req.params.id, operatorId: req.hotelOperator._id });
        if (!hotel) return res.status(404).json({ error: 'Hotel not found or access denied.' });
        res.json({ success: true, message: 'Hotel deleted.' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/hotel-operator/hotels/stats — dashboard stats
router.get('/stats', async (req, res) => {
    try {
        const hotels = await Hotel.find({ operatorId: req.hotelOperator._id });
        const Room = require('../../models/hotel/Room');
        const HotelBooking = require('../../models/hotel/HotelBooking');

        const hotelIds = hotels.map(h => h._id);
        const totalRooms = await Room.countDocuments({ hotelId: { $in: hotelIds } });

        const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
        const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);

        const [todayBookings, monthlyBookings, recentBookings] = await Promise.all([
            HotelBooking.countDocuments({ hotelId: { $in: hotelIds }, createdAt: { $gte: todayStart, $lte: todayEnd } }),
            HotelBooking.countDocuments({ hotelId: { $in: hotelIds }, createdAt: { $gte: monthStart } }),
            HotelBooking.find({ hotelId: { $in: hotelIds } }).sort({ createdAt: -1 }).limit(10).populate('hotelId', 'hotelName'),
        ]);

        res.json({
            success: true,
            stats: {
                totalHotels: hotels.length,
                totalRooms,
                todayBookings,
                monthlyBookings,
            },
            recentBookings,
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
