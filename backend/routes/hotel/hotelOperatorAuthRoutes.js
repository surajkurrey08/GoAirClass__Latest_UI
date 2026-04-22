const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const HotelOperator = require('../../models/hotel/HotelOperator');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// POST /api/hotel-operator/auth/login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password)
            return res.status(400).json({ error: 'Username and password are required.' });

        const operator = await HotelOperator.findOne({
            $or: [{ username }, { email: username }]
        });

        if (!operator)
            return res.status(404).json({ error: 'No account found with this username/email.' });

        if (operator.status !== 'Active')
            return res.status(403).json({ error: 'Account is inactive. Contact your admin.' });

        const isMatch = await bcrypt.compare(password, operator.password);
        if (!isMatch)
            return res.status(400).json({ error: 'Incorrect password.' });

        const token = jwt.sign(
            { id: operator._id, role: operator.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            operator: {
                _id: operator._id,
                name: operator.name,
                email: operator.email,
                phone: operator.phone,
                companyName: operator.companyName,
                city: operator.city,
                username: operator.username,
                role: operator.role,
                permissions: operator.permissions,
                status: operator.status,
            }
        });
    } catch (err) {
        console.error('Hotel Operator Login Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/hotel-operator/auth/me — get logged-in operator profile
router.get('/me', async (req, res) => {
    try {
        const { verifyHotelOperator } = require('../../middleware/hotelOperatorAuth');
        verifyHotelOperator(req, res, async () => {
            res.json({ success: true, operator: req.hotelOperator });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
