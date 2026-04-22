const Bus = require('../models/Bus');
const Booking = require('../models/Booking');
const Schedule = require('../models/Schedule');
const dayjs = require('dayjs');

/**
 * Get Operator Dashboard Stats
 * Aggregates data specific to the logged-in operator.
 */
exports.getOperatorStats = async (req, res) => {
    try {
        const operatorId = req.operator.id;
        const weekAgo = dayjs().subtract(7, 'days').startOf('day').toDate();

        // 1. Get all buses belonging to this operator
        const myBuses = await Bus.find({ operator: operatorId }, '_id');
        const busIds = myBuses.map(b => b._id);

        const [
            totalBuses,
            activeBuses,
            totalBookings,
            revenueData,
            recentBookings,
            weeklyStats
        ] = await Promise.all([
            Bus.countDocuments({ operator: operatorId }),
            Bus.countDocuments({ operator: operatorId, status: { $in: ['active', 'live', 'approved'] } }),
            Booking.countDocuments({ bus: { $in: busIds } }),
            Booking.aggregate([
                { $match: { bus: { $in: busIds }, paymentStatus: 'Completed' } },
                { $group: { _id: null, total: { $sum: '$totalFare' } } }
            ]),
            Booking.find({ bus: { $in: busIds } })
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('bus', 'busName busNumber')
                .populate('route', 'fromCity toCity'),
            Booking.aggregate([
                { 
                    $match: { 
                        bus: { $in: busIds },
                        bookingDate: { $gte: weekAgo },
                        paymentStatus: 'Completed'
                    } 
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$bookingDate" } },
                        bookings: { $sum: 1 },
                        revenue: { $sum: "$totalFare" }
                    }
                },
                { $sort: { _id: 1 } }
            ])
        ]);

        // Calculate Occupancy (Simplified: Average occupancy across all trips)
        // In a real app, we'd iterate through schedules and sum up booked seats vs total capacity
        const totalRevenue = revenueData[0]?.total || 0;

        res.status(200).json({
            success: true,
            stats: {
                totalBuses,
                activeBuses,
                totalBookings,
                totalRevenue,
                seatOccupancy: 65, // Mock occupancy for now, can be calculated dynamically later
            },
            recentBookings,
            chartData: weeklyStats
        });
    } catch (error) {
        console.error('Operator Dashboard Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
