const Hotel = require('../../models/hotel/Hotel');
const Room = require('../../models/hotel/Room');
const HotelCoupon = require('../../models/hotel/HotelCoupon');
const engine = require('../../services/pricingEngine');

const createHotel = async (req, res) => {
    try {
        const hotel = new Hotel(req.body);
        await hotel.save();
        res.status(201).json({ success: true, hotel });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const getAllHotels = async (req, res) => {
    try {
        const hotels = await Hotel.find().sort({ createdAt: -1 });
        res.json({ success: true, hotels });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const getPendingHotels = async (req, res) => {
    try {
        const hotels = await Hotel.find({ status: 'pending' }).sort({ createdAt: -1 });
        res.json({ success: true, hotels });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const getApprovedHotels = async (req, res) => {
    try {
        const { destination } = req.query;
        let query = { status: 'approved' };

        if (destination) {
            const searchRegex = new RegExp(destination, 'i');
            query.$or = [
                { city: searchRegex },
                { address: searchRegex },
                { hotelName: searchRegex }
            ];
        }

        const hotels = await Hotel.find(query).lean().sort({ createdAt: -1 });
        const hotelIds = hotels.map(h => h._id);

        // Fetch active coupons for these hotels
        const now = new Date();
        const allCoupons = await HotelCoupon.find({
            hotelId: { $in: hotelIds },
            status: 'active',
            expiryDate: { $gt: now }
        }).lean();

        // Fetch rooms to determine average/starting price per hotel
        const rooms = await Room.find({ hotelId: { $in: hotelIds } }).lean();

        // Map rooms by hotelId
        const roomsByHotelMap = rooms.reduce((acc, room) => {
            const hid = room.hotelId.toString();
            if (!acc[hid]) acc[hid] = [];
            acc[hid].push(room);
            return acc;
        }, {});

        // Map best coupon per hotel
        const bestCouponMap = allCoupons.reduce((acc, coupon) => {
            const hid = coupon.hotelId.toString();
            
            // Check usage limit
            if (coupon.usageLimit > 0 && coupon.timesUsed >= coupon.usageLimit) return acc;

            const currentBest = acc[hid];
            if (!currentBest) {
                acc[hid] = coupon;
            } else {
                // Logic to pick "best": simple comparison of discountValue
                // Note: This logic could be more complex if mix of percentage/flat
                // but usually flat is higher value than percentage for small values.
                // Assuming the user wants higher discount value displayed.
                if (coupon.discountValue > currentBest.discountValue) {
                    acc[hid] = coupon;
                }
            }
            return acc;
        }, {});

        // Attach starting price and best coupon with live commission calculation
        const hotelsWithDeals = await Promise.all(hotels.map(async (hotel) => {
            const hRooms = roomsByHotelMap[hotel._id.toString()] || [];
            let startingPrice = null;
            if (hRooms.length > 0) {
                startingPrice = Math.min(...hRooms.map(r => r.price || Infinity));
                if (startingPrice === Infinity) startingPrice = null;
            }

            let pricingDetails = null;
            if (startingPrice) {
                // Calculate live commission/GST for the search results
                pricingDetails = await engine.calculate({
                    category: 'Hotel',
                    hotelId: hotel._id,
                    sourceCity: hotel.city,
                    starRating: hotel.starRating,
                    operatorId: hotel.operatorId,
                    basePrice: startingPrice,
                    isWeekend: false, // In a full implementation, these would be dynamic
                    isFestival: false
                });
            }
            
            return {
                ...hotel,
                startingPrice,
                pricing: pricingDetails,
                coupon: bestCouponMap[hotel._id.toString()] || null
            };
        }));

        res.json({ success: true, hotels: hotelsWithDeals });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const getRejectedHotels = async (req, res) => {
    try {
        const hotels = await Hotel.find({ status: 'rejected' }).sort({ createdAt: -1 });
        res.json({ success: true, hotels });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const getHotelById = async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id);
        if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });

        const rooms = await Room.find({ hotelId: req.params.id });

        // Calculate dynamic pricing for each room
        const roomsWithPricing = await Promise.all(rooms.map(async (room) => {
            const pricingDetails = await engine.calculate({
                category: 'Hotel',
                hotelId: hotel._id,
                sourceCity: hotel.city,
                starRating: hotel.starRating,
                operatorId: hotel.operatorId,
                basePrice: room.price,
                isWeekend: false,
                isFestival: false
            });

            return {
                ...room.toObject(),
                basePrice: room.price,
                commission: pricingDetails.commission,
                finalPrice: room.price + pricingDetails.commission,
                pricing: pricingDetails // Also keep the full breakdown
            };
        }));

        res.json({ success: true, hotel, rooms: roomsWithPricing });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const approveHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findByIdAndUpdate(
            req.params.id,
            { status: 'approved', rejectionReason: '' },
            { new: true }
        );
        if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });
        res.json({ success: true, hotel, message: 'Hotel approved successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const rejectHotel = async (req, res) => {
    try {
        const { reason } = req.body;
        const hotel = await Hotel.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected', rejectionReason: reason || 'Rejected by admin' },
            { new: true }
        );
        if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });
        res.json({ success: true, hotel, message: 'Hotel rejected' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const blockHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findByIdAndUpdate(
            req.params.id,
            { isBlocked: true },
            { new: true }
        );
        if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });
        res.json({ success: true, hotel, message: 'Hotel blocked' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const unblockHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findByIdAndUpdate(
            req.params.id,
            { isBlocked: false },
            { new: true }
        );
        if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });
        res.json({ success: true, hotel, message: 'Hotel unblocked' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const deleteHotel = async (req, res) => {
    try {
        await Hotel.findByIdAndDelete(req.params.id);
        await Room.deleteMany({ hotelId: req.params.id });
        res.json({ success: true, message: 'Hotel deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const getHotelDashboardStats = async (req, res) => {
    try {
        const HotelBooking = require('../../models/hotel/HotelBooking');
        const dayjs = require('dayjs');

        const [
            totalHotels,
            pendingApprovals,
            approvedHotels,
            totalBookings,
            revenueData,
            recentHotels,
            rawWeeklyStats
        ] = await Promise.all([
            Hotel.countDocuments(),
            Hotel.countDocuments({ status: 'pending' }),
            Hotel.countDocuments({ status: 'approved' }),
            HotelBooking.countDocuments({ status: 'confirmed' }),
            HotelBooking.aggregate([
                { $match: { paymentStatus: 'Completed' } },
                { $group: { _id: null, total: { $sum: '$totalPrice' } } }
            ]),
            Hotel.find().sort({ createdAt: -1 }).limit(5),
            HotelBooking.aggregate([
                { 
                    $match: { 
                        createdAt: { $gte: dayjs().subtract(7, 'days').startOf('day').toDate() },
                        paymentStatus: 'Completed'
                    } 
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        bookings: { $sum: 1 },
                        revenue: { $sum: "$totalPrice" }
                    }
                },
                { $sort: { _id: 1 } }
            ])
        ]);

        // Standardize the last 7 days to ensure charts are never empty
        const weeklyStats = [];
        for (let i = 6; i >= 0; i--) {
            const dateStr = dayjs().subtract(i, 'days').format('YYYY-MM-DD');
            const dayData = rawWeeklyStats.find(s => s._id === dateStr);
            weeklyStats.push({
                _id: dateStr,
                bookings: dayData ? dayData.bookings : 0,
                revenue: dayData ? dayData.revenue : 0
            });
        }

        res.json({
            success: true,
            stats: {
                totalHotels,
                pendingApprovals,
                approvedHotels,
                totalBookings,
                totalRevenue: revenueData[0]?.total || 0,
            },
            recentHotels,
            chartData: weeklyStats
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = {
    createHotel,
    getAllHotels,
    getPendingHotels,
    getApprovedHotels,
    getRejectedHotels,
    getHotelById,
    approveHotel,
    rejectHotel,
    blockHotel,
    unblockHotel,
    deleteHotel,
    getHotelDashboardStats,
};
