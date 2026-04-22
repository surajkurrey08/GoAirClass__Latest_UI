const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Bus = require('../models/Bus');
const { operatorAuthMiddleware } = require('../middleware/operatorAuthMiddleware');

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Create Bus with Images
router.post('/create', operatorAuthMiddleware, upload.array('images', 6), async (req, res) => {
    try {
        const imagePaths = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

        // Parse JSON fields if sent as FormData
        const busData = {
            ...req.body,
            images: imagePaths,
            operator: req.operator.id
        };

        // Convert types if necessary (FormData sends everything as strings)
        if (typeof busData.totalSeats === 'string') {
            busData.totalSeats = parseInt(busData.totalSeats);
        }
        if (typeof busData.amenities === 'string') {
            try {
                busData.amenities = JSON.parse(busData.amenities);
            } catch (e) {
                busData.amenities = busData.amenities.split(',').map(a => a.trim());
            }
        }
        if (typeof busData.seatLayout === 'string') {
            try {
                busData.seatLayout = JSON.parse(busData.seatLayout);
            } catch (e) {
                busData.seatLayout = [];
            }
        }

        const bus = new Bus(busData);
        await bus.save();
        res.status(201).json(bus);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get by Operator (Current logged-in operator)
router.get('/my-buses', operatorAuthMiddleware, async (req, res) => {
    try {
        const { routeIds } = req.query;
        let query = { operator: req.operator.id };

        if (routeIds) {
            const Schedule = require('../models/Schedule');
            const schedules = await Schedule.find({ 
                operator: req.operator.id, 
                route: { $in: routeIds.split(',') } 
            });
            const busIds = schedules.map(s => s.bus);
            query._id = { $in: busIds };
        }

        const buses = await Bus.find(query);
        res.json(buses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get All (For Admin) — scoped by adminId for 'admin' role, all for 'superadmin'
router.get('/all', async (req, res) => {
    try {
        const buses = await Bus.find().populate('operator');
        res.json(buses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/buses - Aggregated for Sandbox
router.get('/', async (req, res) => {
    try {
        const Schedule = require('../models/Schedule');
        const schedules = await Schedule.find()
            .populate('bus')
            .populate('route')
            .populate('operator');
        
        const mergedData = schedules.map(s => ({
            _id: s.bus?._id,
            busName: s.bus?.busName || 'Unknown Bus',
            busType: s.bus?.busType || 'Sleeper',
            seatType: (s.bus?.amenities || []).some(a => a.toUpperCase().includes('AC')) ? 'AC' : 'Non-AC',
            operatorId: s.operator?._id,
            fromCity: s.route?.fromCity,
            toCity: s.route?.toCity,
            distance: s.route?.distance,
            baseFare: s.ticketPrice
        })).filter(item => item._id); // Only return buses with schedules

        res.json(mergedData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Single Bus by ID (for View/Edit pages)
router.get('/:id', async (req, res) => {
    try {
        const bus = await Bus.findById(req.params.id).populate('operator');
        if (!bus) return res.status(404).json({ error: 'Bus not found' });
        res.json(bus);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update
router.put('/:id', operatorAuthMiddleware, async (req, res) => {
    try {
        // Ensure the bus belongs to the logged-in operator
        const bus = await Bus.findOneAndUpdate(
            { _id: req.params.id, operator: req.operator.id },
            req.body,
            { new: true }
        );
        if (!bus) {
            return res.status(404).json({ error: 'Bus not found or unauthorized' });
        }
        res.json(bus);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete
router.delete('/:id', operatorAuthMiddleware, async (req, res) => {
    try {
        // Ensure the bus belongs to the logged-in operator
        const bus = await Bus.findOneAndDelete({ _id: req.params.id, operator: req.operator.id });
        if (!bus) {
            return res.status(404).json({ error: 'Bus not found or unauthorized' });
        }
        res.json({ message: 'Bus deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
