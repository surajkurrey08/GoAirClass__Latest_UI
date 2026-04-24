const Coupon = require('../models/Coupon');

/**
 * Get available coupons for a specific bus journey
 */
exports.getAvailableCoupons = async (req, res) => {
    try {
        const { routeId, operatorId, amount } = req.query;
        const now = new Date();

        // Query for active, non-expired coupons applicable on Bus or All
        let query = {
            status: 'Active',
            applicableOn: { $in: ['Bus', 'All'] },
            validFrom: { $lte: now },
            validTill: { $gte: now },
            totalUsageLimit: { $gt: 0 } // Basic check, could be analytics.totalTimesUsed < totalUsageLimit
        };

        // Filter by booking amount if provided
        if (amount) {
            query.minBookingAmount = { $lte: Number(amount) };
        }

        const coupons = await Coupon.find(query)
            .select('code description discountType discountValue maxDiscountAmount rules slabs minBookingAmount applicableRoutes specificOperators applyToAllRoutes');

        // Filter based on specific applicability (route, operator)
        const filteredCoupons = coupons.filter(coupon => {
            // Check Route Applicability
            if (!coupon.applyToAllRoutes && routeId) {
                if (!coupon.applicableRoutes.some(r => r.toString() === routeId)) return false;
            }

            // Check Operator Applicability
            if (coupon.specificOperators?.length > 0 && operatorId) {
                if (!coupon.specificOperators.some(op => op.toString() === operatorId)) return false;
            }

            return true;
        });

        res.json({ success: true, coupons: filteredCoupons });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Apply a coupon code and calculate discount
 */
exports.applyCoupon = async (req, res) => {
    try {
        const { code, amount, routeId, operatorId, userId } = req.body;
        const now = new Date();

        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            return res.status(404).json({ success: false, message: "Invalid coupon code" });
        }

        // 1. Status & Expiry Check
        if (coupon.status !== 'Active' || now > coupon.validTill || now < coupon.validFrom) {
            return res.status(400).json({ success: false, message: "Coupon has expired or is inactive" });
        }

        // 2. Usage Limit Check
        if (coupon.analytics.totalTimesUsed >= coupon.totalUsageLimit) {
            return res.status(400).json({ success: false, message: "Coupon usage limit reached" });
        }

        // 3. Minimum Amount Check
        if (amount < coupon.minBookingAmount) {
            return res.status(400).json({ success: false, message: `Minimum booking amount of ₹${coupon.minBookingAmount} required` });
        }

        // 4. Route & Operator Check
        if (!coupon.applyToAllRoutes && routeId && !coupon.applicableRoutes.some(r => r.toString() === routeId)) {
            return res.status(400).json({ success: false, message: "Coupon not applicable on this route" });
        }

        if (coupon.specificOperators?.length > 0 && operatorId && !coupon.specificOperators.some(op => op.toString() === operatorId)) {
            return res.status(400).json({ success: false, message: "Coupon not applicable for this bus operator" });
        }

        // 5. Calculate Discount
        let discount = 0;

        if (coupon.discountType === 'percentage') {
            discount = (amount * coupon.discountValue) / 100;
            if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
                discount = coupon.maxDiscountAmount;
            }
        } else if (coupon.discountType === 'flat') {
            discount = coupon.discountValue;
        } else if (coupon.discountType === 'slab') {
            const slab = coupon.slabs.find(s => amount >= s.minAmount && (!s.maxAmount || amount <= s.maxAmount));
            if (slab) {
                if (slab.discountType === 'percentage') {
                    discount = (amount * slab.discountValue) / 100;
                } else {
                    discount = slab.discountValue;
                }
            } else {
                return res.status(400).json({ success: false, message: "Coupon not applicable for this amount slab" });
            }
        }

        // Ensure discount doesn't exceed amount
        if (discount > amount) discount = amount;

        const finalAmount = amount - discount;

        res.json({
            success: true,
            discount,
            finalAmount,
            coupon: {
                code: coupon.code,
                description: coupon.description
            },
            message: "Coupon applied successfully"
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Create a new coupon (Admin/Operator)
 */
exports.createCoupon = async (req, res) => {
    try {
        const couponData = {
            ...req.body,
            createdBy: req.user.id,
            role: req.user.role
        };
        const coupon = new Coupon(couponData);
        await coupon.save();
        res.status(201).json({ success: true, message: "Coupon created successfully", coupon });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * List coupons for management
 */
exports.listCoupons = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'operator' || req.user.role === 'bus_operator') {
            query.createdBy = req.user.id;
        }
        const coupons = await Coupon.find(query).sort({ createdAt: -1 });
        res.json({ success: true, coupons });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
