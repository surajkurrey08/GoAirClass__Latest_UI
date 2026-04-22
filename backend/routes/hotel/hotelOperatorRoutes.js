const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const HotelOperator = require('../../models/hotel/HotelOperator');

// POST /api/hotel-operators — Create new hotel operator
router.post('/', async (req, res) => {
    try {
        const {
            name, phone, email, companyName, city, address,
            username, password, role, permissions, status
        } = req.body;

        // Validate required fields
        if (!name || !email || !username || !password) {
            return res.status(400).json({ error: 'Name, email, username and password are required.' });
        }

        // Check duplicate email / username
        const existing = await HotelOperator.findOne({ $or: [{ email }, { username }] });
        if (existing) {
            const field = existing.email === email ? 'email' : 'username';
            return res.status(409).json({ error: `An operator with this ${field} already exists.` });
        }

        const hashed = await bcrypt.hash(password, 10);

        const operator = await HotelOperator.create({
            name, phone, email, companyName, city, address,
            username, password: hashed,
            role: role || 'hotel_operator',
            permissions: permissions || [],
            status: status || 'Active',
        });

        res.status(201).json({ success: true, message: 'Hotel operator created successfully.', operator });
    } catch (err) {
        console.error('Create hotel operator error:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/hotel-operators — List all hotel operators
router.get('/', async (req, res) => {
    try {
        const operators = await HotelOperator.find().select('-password').sort({ createdAt: -1 });
        res.json({ success: true, operators });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/hotel-operators/:id
router.delete('/:id', async (req, res) => {
    try {
        await HotelOperator.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Hotel operator deleted.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/hotel-operators/:id/status — Toggle active/inactive
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const op = await HotelOperator.findByIdAndUpdate(req.params.id, { status }, { new: true }).select('-password');
        res.json({ success: true, operator: op });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
