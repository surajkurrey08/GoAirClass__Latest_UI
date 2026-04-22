const Flight = require('../../models/flight/flight.model');
const FlightBooking = require('../../models/flight/flightBooking.model');
const User = require('../../models/User');

// GET /api/flights/dashboard — summary stats
const getDashboardStats = async (req, res) => {
    try {
        const totalFlights = await Flight.countDocuments();
        const totalBookings = await FlightBooking.countDocuments();
        const totalUsers = await User.countDocuments();

        // Today's bookings
        const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
        const todaysBookings = await FlightBooking.countDocuments({
            createdAt: { $gte: todayStart, $lte: todayEnd }
        });

        // Total revenue
        const revenueResult = await FlightBooking.aggregate([
            { $match: { paymentStatus: 'PAID' } },
            { $group: { _id: null, total: { $sum: '$fareDetails.totalAmount' } } }
        ]);
        const totalRevenue = revenueResult[0]?.total || 0;

        // Upcoming flights
        const upcomingFlights = await Flight.countDocuments({
            status: 'Scheduled',
            departureTime: { $gte: new Date() }
        });

        res.json({ 
            success: true, 
            stats: { 
                totalFlights, 
                bookings: totalBookings, 
                todaysBookings, 
                revenue: totalRevenue, 
                users: totalUsers,
                upcomingFlights 
            } 
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// GET /api/flights/dashboard/recent-bookings
const getRecentBookings = async (req, res) => {
    try {
        const bookings = await FlightBooking.find()
            .populate('userId', 'fullName email')
            .populate({
                path: 'flightId',
                select: 'flightNumber fromAirport toAirport departureTime',
                populate: [{ path: 'fromAirport', select: 'airportCode city' }, { path: 'toAirport', select: 'airportCode city' }]
            })
            .sort({ createdAt: -1 })
            .limit(10);
        res.json({ success: true, bookings });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// GET /api/flights/dashboard/trend
const getBookingTrend = async (req, res) => {
    try {
        const days = 7;
        const trend = [];
        for (let i = days - 1; i >= 0; i--) {
            const start = new Date(); start.setDate(start.getDate() - i); start.setHours(0, 0, 0, 0);
            const end = new Date(); end.setDate(end.getDate() - i); end.setHours(23, 59, 59, 999);
            const count = await FlightBooking.countDocuments({ createdAt: { $gte: start, $lte: end } });
            trend.push({ date: start.toISOString().slice(0, 10), count });
        }
        res.json({ success: true, trend });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = { getDashboardStats, getRecentBookings, getBookingTrend };
