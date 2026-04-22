const Coupon = require('../models/Coupon');
const Booking = require('../models/Booking');
const Commission = require('../models/Commission');
const Operator = require('../models/Operator');
const User = require('../models/User');
const mongoose = require('mongoose');

/**
 * @desc Create a new coupon
 * @route POST /admin/coupons/create
 */
exports.createCoupon = async (req, res) => {
    try {
        const {
            code,
            description,
            discountType,
            discountValue,
            maxDiscountAmount,
            fundingType,
            fundingDetails,
            applicableOn,
            sourceCities,
            destinationCities,
            busTypes,
            specificOperators,
            minBookingAmount,
            totalUsageLimit,
            perUserLimit,
            firstUserOnly,
            validFrom,
            validTill,
            isGlobal
        } = req.body;

        // Extract user info from req.user (populated by authMiddleware)
        const createdBy = req.user.id;
        let role = req.user.role;

        // Normalize operator roles
        if (role === 'bus_operator') role = 'operator';

        if (!createdBy || !role) {
            return res.status(401).json({ message: 'User authentication required' });
        }

        // Check if coupon already exists
        const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
            return res.status(400).json({ message: 'Coupon code already exists' });
        }

        // Validate funding details if SHARED
        if (fundingType === 'SHARED') {
            const totalShare = (fundingDetails.operatorShare || 0) + (fundingDetails.adminShare || 0);
            if (totalShare !== 100) {
                return res.status(400).json({ message: 'Operator and Admin share must sum to 100%' });
            }
        }

        const newCoupon = new Coupon({
            code: code.toUpperCase(),
            description,
            discountType,
            discountValue,
            maxDiscountAmount,
            fundingType,
            fundingDetails,
            applicableOn,
            sourceCities,
            destinationCities,
            busTypes,
            specificOperators,
            minBookingAmount,
            totalUsageLimit,
            perUserLimit,
            firstUserOnly,
            validFrom,
            validTill,
            isGlobal,
            createdBy,
            role
        });

        await newCoupon.save();
        res.status(201).json({ message: 'Coupon created successfully', coupon: newCoupon });
    } catch (error) {
        console.error('Error creating coupon:', error);
        res.status(500).json({ message: 'Error creating coupon', error: error.message });
    }
};

/**
 * @desc List all coupons with filters
 * @route GET /admin/coupons/list
 */
exports.listCoupons = async (req, res) => {
    try {
        const { status, highUsage } = req.query;
        let query = {};
        const now = new Date();

        if (status) {
            if (status === 'Expired') {
                query.validTill = { $lt: now };
            } else if (status === 'Active') {
                query.status = 'Active';
                query.validTill = { $gte: now };
            } else if (status === 'Inactive') {
                query.status = 'Inactive';
            } else {
                query.status = status;
            }
        }

        // Role-based filtering
        const { role, id } = req.user;
        const isOperator = (role === 'operator' || role === 'bus_operator');

        if (isOperator) {
            query.createdBy = id;
            query.role = { $in: ['operator', 'bus_operator'] };
        } else if (role === 'superadmin' || role === 'admin') {
            // Admins see only admin coupons by default in their panel
            query.role = { $in: ['superadmin', 'admin'] };
        }

        let coupons = await Coupon.find(query).sort({ createdAt: -1 });

        if (highUsage === 'true') {
            coupons = coupons.filter(c => (c.analytics.totalTimesUsed / c.totalUsageLimit) > 0.8);
        }

        res.status(200).json(coupons);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching coupons', error: error.message });
    }
};

/**
 * @desc Update coupon or toggle status
 * @route PUT /admin/coupons/update/:id
 */
exports.updateCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
        res.status(200).json({ message: 'Coupon updated successfully', coupon });
    } catch (error) {
        res.status(500).json({ message: 'Error updating coupon', error: error.message });
    }
};

/**
 * @desc Apply coupon logic
 * @route POST /booking/apply-coupon
 */
exports.applyCoupon = async (req, res) => {
    try {
        const { code, bookingDetails, userId } = req.body;
        // bookingDetails: { baseFare, category, sourceCity, destinationCity, busType, operatorId, isFirstBooking }

        const coupons = await Coupon.find({ code: code.toUpperCase(), status: 'Active' });
        if (!coupons || coupons.length === 0) return res.status(400).json({ message: 'ERR_NOT_FOUND: Invalid or inactive coupon' });

        let coupon = null;
        let busOperator = null;
        
        // Find the best match for THIS journey
        if (bookingDetails.operatorId) {
            busOperator = await Operator.findById(bookingDetails.operatorId);
        }

        for (const c of coupons) {
            // TARGETING MATCH (If explicitly selected this bus/route, automatically pass the link check)
            const isBusMatched = c.applicableBuses && bookingDetails.busId && c.applicableBuses.map(id => id.toString()).includes(bookingDetails.busId.toString());
            const isRouteMatched = c.applicableRoutes && bookingDetails.routeId && c.applicableRoutes.map(id => id.toString()).includes(bookingDetails.routeId.toString());

            // Case 1: SuperAdmin Coupon
            if (c.role === 'superadmin' || c.role === 'admin') {
                if (c.isGlobal || isBusMatched || isRouteMatched) {
                    coupon = c;
                    break;
                }
                if (c.specificOperators && bookingDetails.operatorId) {
                    const operatorIdStr = bookingDetails.operatorId.toString();
                    if (c.specificOperators.map(id => id.toString()).includes(operatorIdStr)) {
                        coupon = c;
                        break;
                    }
                }
            }
            
            // Case 2: Operator Coupon (Direct ID match, Link match, Email match, OR Explicit Targeting)
            if (c.role === 'operator' && (bookingDetails.operatorId || isBusMatched || isRouteMatched)) {
                // If the creator explicitly targeted this bus/route, we don't need a strict operator link
                if (isBusMatched || isRouteMatched) {
                    coupon = c;
                    break;
                }

                const operatorIdStr = (bookingDetails.operatorId || '').toString();
                const couponCreatorIdStr = c.createdBy.toString();
                
                // Direct match
                if (couponCreatorIdStr === operatorIdStr) {
                    coupon = c;
                    break;
                }
                
                // Link match (if createdBy is the User ID who owns the Operator)
                if (busOperator && busOperator.adminId && busOperator.adminId.toString() === couponCreatorIdStr) {
                    coupon = c;
                    break;
                }

                // SuperAdmin Bypass (If an admin created this operator deal, allow it)
                const creatorUser = await User.findById(c.createdBy);
                if (creatorUser && (creatorUser.role === 'superadmin' || creatorUser.role === 'admin')) {
                    coupon = c;
                    break;
                }

                // Fallback: Email Match
                if (busOperator && creatorUser && creatorUser.email && creatorUser.email === busOperator.email) {
                    coupon = c;
                    break;
                }
            }
        }

        if (!coupon) {
            return res.status(400).json({ message: 'ERR_OP_LINK: This coupon is not valid for the selected operator or journey' });
        }

        // 1. Check validity dates
        const now = new Date();
        if (now < coupon.validFrom || now > coupon.validTill) {
            return res.status(400).json({ message: 'Coupon has expired or is not yet active' });
        }

        // 1.1 Check Time-based targeting (Weekend & Hour)
        if (coupon.targeting.isWeekendOnly) {
            const day = now.getDay(); // 0 is Sunday, 6 is Saturday
            if (day !== 0 && day !== 6) {
                return res.status(400).json({ message: 'This offer is only available on Weekends' });
            }
        }

        if (coupon.targeting.timeWindow && coupon.targeting.timeWindow.startHour !== undefined) {
            const currentHour = now.getHours();
            const { startHour, endHour } = coupon.targeting.timeWindow;
            if (currentHour < startHour || currentHour > endHour) {
                return res.status(400).json({ message: `This offer is available between ${startHour}:00 and ${endHour}:00` });
            }
        }

        // 2. Check total usage limit (Dual verification: Counter + Real-time Database check)
        const dbUsageCount = await Booking.countDocuments({
            couponCode: coupon.code.toUpperCase(),
            status: 'Confirmed'
        });

        const effectiveUsage = Math.max(coupon.analytics.totalTimesUsed || 0, dbUsageCount);
        if (coupon.totalUsageLimit > 0 && effectiveUsage >= coupon.totalUsageLimit) {
            return res.status(400).json({ message: 'Coupon usage limit reached' });
        }

        // 3. Fraud Prevention Checklist (Device, IP, User)
        if (userId) {
            const userUsage = await Booking.countDocuments({ userId, couponCode: coupon.code, status: 'Confirmed' });
            const limitToUse = coupon.userLimit || coupon.perUserLimit || 1;
            if (userUsage >= limitToUse) {
                return res.status(400).json({ message: 'You have already reached the usage limit for this coupon' });
            }

            // Target User Type check
            if (coupon.targeting.userTypes && !coupon.targeting.userTypes.includes('All')) {
                const totalUserBookings = await Booking.countDocuments({ userId, status: 'Confirmed' });
                const isNewUser = totalUserBookings === 0;

                if (coupon.targeting.userTypes.includes('New') && !isNewUser) {
                    return res.status(400).json({ message: 'This coupon is for first-time users only' });
                }
                if (coupon.targeting.userTypes.includes('Existing') && isNewUser) {
                    return res.status(400).json({ message: 'This coupon is for our regular travelers' });
                }
            }
        }

        const deviceId = req.body.deviceId || bookingDetails.deviceId;
        if (deviceId && coupon.fraud.deviceLimit) {
            const deviceUsage = await Booking.countDocuments({ deviceId, couponCode: coupon.code, status: 'Confirmed' });
            if (deviceUsage >= coupon.fraud.deviceLimit) {
                return res.status(400).json({ message: 'Coupon limit reached for this device' });
            }
        }

        // 5. Min Booking Amount
        if (bookingDetails.baseFare < coupon.minBookingAmount) {
            return res.status(400).json({ message: `Minimum booking amount of ₹${coupon.minBookingAmount} required` });
        }

        // 6. Applicability checks (Routes, Bus Type, etc.)
        if (coupon.applicableOn !== 'All' && coupon.applicableOn !== bookingDetails.category && bookingDetails.category !== 'Bus') {
            return res.status(400).json({ message: `Coupon is only applicable on ${coupon.applicableOn}` });
        }

        // 6.1 Check Route Constraints (Strict only if NOT global AND NOT matching in search)
        if (coupon.isGlobal === false && coupon.applyToAllRoutes === false) {
            if (coupon.applicableRoutes && coupon.applicableRoutes.length > 0) {
                if (!bookingDetails.routeId || !coupon.applicableRoutes.map(r => r.toString()).includes(bookingDetails.routeId.toString())) {
                    return res.status(400).json({ message: 'ERR_ROUTE_MISMATCH: Coupon is not applicable for this route' });
                }
            }
        }

        // 6.2 Check Bus Constraints (Strict only if NOT global AND NOT matching in search)
        if (coupon.isGlobal === false && coupon.applyToAllBuses === false) {
            if (coupon.applicableBuses && coupon.applicableBuses.length > 0) {
                if (!bookingDetails.busId || !coupon.applicableBuses.map(b => b.toString()).includes(bookingDetails.busId.toString())) {
                    return res.status(400).json({ message: 'ERR_BUS_MISMATCH: Coupon is not applicable for this bus' });
                }
            }
        }

        // 7. Calculate Discount (Support for SLABS)
        let discount = 0;
        let appliedSlab = null;

        if (coupon.discountType === 'slab') {
            // Find the highest matching slab
            const sortedSlabs = [...coupon.slabs].sort((a, b) => b.minAmount - a.minAmount);
            appliedSlab = sortedSlabs.find(slab => bookingDetails.baseFare >= slab.minAmount);

            if (!appliedSlab) {
                return res.status(400).json({ message: 'Booking amount is too low for this slab offer' });
            }

            if (appliedSlab.discountType === 'flat') {
                discount = appliedSlab.discountValue;
            } else {
                discount = (bookingDetails.baseFare * appliedSlab.discountValue) / 100;
            }
        } else if (coupon.discountType === 'flat') {
            discount = coupon.discountValue;
        } else {
            discount = (bookingDetails.baseFare * coupon.discountValue) / 100;
            if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
                discount = coupon.maxDiscountAmount;
            }
        }

        // 8. Integration with Commission & Funding
        let adminCommission = bookingDetails.commission || 0;
        let operatorShareDeduction = 0;
        let adminShareDeduction = 0;

        if (coupon.fundingType === 'SUPER_ADMIN') {
            adminShareDeduction = discount;
        } else { // SHARED
            operatorShareDeduction = (discount * coupon.fundingDetails.operatorShare) / 100;
            adminShareDeduction = (discount * coupon.fundingDetails.adminShare) / 100;
        }

        const finalPrice = bookingDetails.baseFare + adminCommission - discount;

        res.status(200).json({
            success: true,
            valid: true,
            message: 'Coupon applied successfully',
            discount,
            finalPrice,
            couponCode: coupon.code,
            couponCategory: coupon.couponCategory,
            appliedSlab,
            breakdown: {
                operatorShareDeduction,
                adminShareDeduction
            }
        });

    } catch (error) {
        console.error('Error applying coupon:', error);
        res.status(500).json({ message: 'Error applying coupon', error: error.message });
    }
};

/**
 * @desc Delete a coupon
 * @route DELETE /admin/coupons/delete/:id
 */
exports.deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);
        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }
        res.status(200).json({ message: 'Coupon deleted successfully' });
    } catch (error) {
        console.error('Error deleting coupon:', error);
        res.status(500).json({ message: 'Error deleting coupon', error: error.message });
    }
};

/**
 * @desc Get coupons for a specific bus (Listing Page)
 * @route GET /api/coupons/bus/:busId
 */
exports.getCouponsByBus = async (req, res) => {
    try {
        const { busId } = req.params;
        const now = new Date();

        if (!busId || !mongoose.Types.ObjectId.isValid(busId)) {
            return res.status(200).json([]);
        }

        const coupons = await Coupon.find({
            status: 'Active',
            validTill: { $gt: now },
            role: 'operator',
            $or: [
                { applicableBuses: busId },
                { applyToAllBuses: true }
            ]
        }).select('code discountValue discountType description role');

        res.status(200).json(coupons);
    } catch (error) {
        console.error('Error fetching bus coupons:', error);
        res.status(500).json({ message: 'Error fetching bus coupons', error: error.message });
    }
};

/**
 * @desc Get coupons for payment page (SuperAdmin Global + Operator Bus Specific)
 * @route GET /api/coupons/payment/:busId
 */
exports.getCouponsForPayment = async (req, res) => {
    try {
        const { busId } = req.params;
        const now = new Date();
        const isValidBusId = busId && mongoose.Types.ObjectId.isValid(busId);

        const query = {
            status: 'Active',
            validTill: { $gt: now },
            applicableOn: { $in: ['Bus', 'All'] },
            $or: [
                {
                    role: { $in: ['superadmin', 'admin'] },
                    isGlobal: true
                }
            ]
        };

        if (isValidBusId) {
            query.$or.push({
                role: 'operator',
                $or: [
                    { applicableBuses: busId },
                    { applyToAllBuses: true }
                ]
            });
        }

        const coupons = await Coupon.find(query).sort({ createdAt: -1 });

        res.status(200).json(coupons);
    } catch (error) {
        console.error('Error fetching payment coupons:', error);
        res.status(500).json({ message: 'Error fetching payment coupons', error: error.message });
    }
};

/**
 * @desc Get global coupons (Public, for carousels/banners)
 * @route GET /api/coupons/public/list
 */
exports.getGlobalCoupons = async (req, res) => {
    try {
        const now = new Date();
        const coupons = await Coupon.find({
            status: 'Active',
            validTill: { $gt: now },
            applicableOn: { $in: ['Bus', 'All'] },
            role: { $in: ['superadmin', 'admin'] },
            isGlobal: true
        }).sort({ createdAt: -1 });

        res.status(200).json(coupons);
    } catch (error) {
        console.error('Error fetching global coupons:', error);
        res.status(500).json({ message: 'Error fetching global coupons', error: error.message });
    }
};

