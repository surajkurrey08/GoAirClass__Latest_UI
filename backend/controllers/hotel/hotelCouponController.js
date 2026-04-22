const HotelCoupon = require('../../models/hotel/HotelCoupon');

// Create a new coupon
exports.createCoupon = async (req, res) => {
    try {
        const { hotelId, couponCode, discountType, discountValue, minBookingAmount, maxDiscount, expiryDate, usageLimit, status } = req.body;

        if (!hotelId || !couponCode || !discountType || !discountValue || !expiryDate) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const existingCoupon = await HotelCoupon.findOne({ hotelId, couponCode: couponCode.toUpperCase() });
        if (existingCoupon) {
            return res.status(400).json({ success: false, message: 'Coupon code already exists for this hotel' });
        }

        const coupon = new HotelCoupon({
            hotelId,
            couponCode,
            discountType,
            discountValue,
            minBookingAmount: minBookingAmount || 0,
            maxDiscount: maxDiscount || 0,
            expiryDate,
            usageLimit: usageLimit || 0,
            status: status || 'active'
        });

        await coupon.save();
        res.status(201).json({ success: true, coupon, message: 'Coupon created successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get all coupons for a hotel operator
exports.getCouponsByHotel = async (req, res) => {
    try {
        const coupons = await HotelCoupon.find({ hotelId: req.params.hotelId }).sort({ createdAt: -1 });
        res.json({ success: true, coupons });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Validate a coupon (Frontend Booking)
exports.validateCoupon = async (req, res) => {
    try {
        const { hotelId, couponCode, bookingAmount } = req.body;

        if (!hotelId || !couponCode || !bookingAmount) {
            return res.status(400).json({ success: false, message: 'Missing required validation fields' });
        }

        const coupon = await HotelCoupon.findOne({ hotelId, couponCode: couponCode.toUpperCase(), status: 'active' });

        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Invalid or inactive coupon' });
        }

        if (new Date() > new Date(coupon.expiryDate)) {
            return res.status(400).json({ success: false, message: 'Coupon has expired' });
        }

        if (coupon.usageLimit > 0 && coupon.timesUsed >= coupon.usageLimit) {
            return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
        }

        if (bookingAmount < coupon.minBookingAmount) {
            return res.status(400).json({ success: false, message: `Minimum booking amount should be ₹${coupon.minBookingAmount}` });
        }

        let discount = 0;
        if (coupon.discountType === 'flat') {
            discount = coupon.discountValue;
        } else if (coupon.discountType === 'percentage') {
            discount = (bookingAmount * coupon.discountValue) / 100;
            if (coupon.maxDiscount > 0 && discount > coupon.maxDiscount) {
                discount = coupon.maxDiscount;
            }
        }

        res.json({ success: true, discount, coupon, message: 'Coupon applied successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Update coupon status
exports.updateCouponStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const coupon = await HotelCoupon.findByIdAndUpdate(req.params.id, { status }, { new: true });

        if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
        res.json({ success: true, coupon, message: `Coupon marked as ${status}` });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Delete a coupon
exports.deleteCoupon = async (req, res) => {
    try {
        const coupon = await HotelCoupon.findByIdAndDelete(req.params.id);
        if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
        res.json({ success: true, message: 'Coupon deleted completely' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get available coupons for a booking
exports.getAvailableCoupons = async (req, res) => {
    try {
        const { hotelId, amount } = req.query;
        if (!hotelId || !amount) {
            return res.status(400).json({ success: false, message: 'Missing hotelId or amount' });
        }

        const bookingAmount = Number(amount);

        const coupons = await HotelCoupon.find({
            hotelId,
            status: 'active',
            expiryDate: { $gt: new Date() },
            minBookingAmount: { $lte: bookingAmount },
        }).sort({ discountValue: -1 });

        // Filter out those that exceeded usage limit
        const validCoupons = coupons.filter(c => c.usageLimit === 0 || c.timesUsed < c.usageLimit);

        res.json({ success: true, coupons: validCoupons });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

