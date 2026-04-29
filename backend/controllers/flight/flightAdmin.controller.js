const dayjs = require('dayjs');
const Flight = require('../../models/flight/flight.model');
const Airline = require('../../models/flight/airline.model');
const Airport = require('../../models/flight/airport.model');
const FlightRoute = require('../../models/flight/route.model');
const FlightInventory = require('../../models/flight/flightInventory.model'); // Keep for now just in case
const FlightPricingRule = require('../../models/flight/flightPricingRule.model');
const FlightBooking = require('../../models/flight/flightBooking.model');
const FlightRefund = require('../../models/flight/flightRefund.model');
const FlightSupportTicket = require('../../models/flight/flightSupportTicket.model');

/**
 * Manage Flight API Configurations
 */
exports.saveApiConfig = async (req, res) => {
    try {
        const { provider, apiKey, apiSecret, environment, status } = req.body;
        let config = await FlightApiConfig.findOne({ provider });

        if (config) {
            config.apiKey = apiKey;
            config.apiSecret = apiSecret;
            config.environment = environment;
            config.status = status;
            await config.save();
        } else {
            config = new FlightApiConfig(req.body);
            await config.save();
        }

        res.status(200).json({ success: true, message: 'API Configuration saved successfully', config });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getApiConfigs = async (req, res) => {
    try {
        const configs = await FlightApiConfig.find();
        res.status(200).json({ success: true, configs });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Manage Airlines
 */
exports.addAirline = async (req, res) => {
    try {
        const airline = new Airline(req.body);
        await airline.save();
        res.status(201).json({ success: true, message: 'Airline added successfully', airline });
    } catch (error) {
        console.error("Add Airline Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getAirlines = async (req, res) => {
    try {
        const airlines = await Airline.find().sort({ priority: -1, name: 1 });
        res.status(200).json({ success: true, airlines });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.updateAirline = async (req, res) => {
    try {
        const airline = await Airline.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!airline) return res.status(404).json({ success: false, message: 'Airline not found' });
        res.status(200).json({ success: true, message: 'Airline updated successfully', airline });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.toggleAirlineStatus = async (req, res) => {
    try {
        const airline = await Airline.findById(req.params.id);
        if (!airline) return res.status(404).json({ success: false, message: 'Airline not found' });
        
        airline.status = !airline.status;
        await airline.save();
        
        res.status(200).json({ success: true, message: `Airline ${airline.status ? 'activated' : 'deactivated'} successfully`, airline });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Manage Airports
 */
exports.addAirport = async (req, res) => {
    try {
        const airport = new Airport(req.body);
        await airport.save();
        res.status(201).json({ success: true, message: 'Airport added successfully', airport });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getAirports = async (req, res) => {
    try {
        const { search, country, type, status } = req.query;
        let query = {};
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { airportName: { $regex: search, $options: 'i' } },
                { iataCode: { $regex: search, $options: 'i' } },
                { airportCode: { $regex: search, $options: 'i' } },
                { city: { $regex: search, $options: 'i' } }
            ];
        }
        if (country) query.country = country;
        if (type) query.type = type;
        
        if (status !== undefined) {
            query.status = (status === 'true' || status === true);
        }

        const airports = await Airport.find(query).sort({ createdAt: -1 });
        res.status(200).json({ success: true, airports });
    } catch (error) {
        console.error("Get Airports Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.updateAirport = async (req, res) => {
    try {
        const airport = await Airport.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!airport) return res.status(404).json({ success: false, message: 'Airport not found' });
        res.status(200).json({ success: true, message: 'Airport updated successfully', airport });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deleteAirport = async (req, res) => {
    try {
        const airport = await Airport.findByIdAndDelete(req.params.id);
        if (!airport) return res.status(404).json({ success: false, message: 'Airport not found' });
        res.status(200).json({ success: true, message: 'Airport deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Manage Flight Routes
 */
exports.addRoute = async (req, res) => {
    try {
        const { from, to } = req.body;
        const routeCode = `${from}-${to}`.toUpperCase();
        
        // Check for duplicate
        const existing = await FlightRoute.findOne({ routeCode });
        if (existing) return res.status(400).json({ success: false, message: 'Route already exists' });

        const route = new FlightRoute({ ...req.body, routeCode });
        await route.save();
        res.status(201).json({ success: true, message: 'Route added successfully', route });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getRoutes = async (req, res) => {
    try {
        const { search, status } = req.query;
        let query = {};
        
        if (search) {
            query.$or = [
                { from: { $regex: search, $options: 'i' } },
                { to: { $regex: search, $options: 'i' } },
                { fromCity: { $regex: search, $options: 'i' } },
                { toCity: { $regex: search, $options: 'i' } },
                { routeCode: { $regex: search, $options: 'i' } }
            ];
        }
        if (status !== undefined) query.status = status === 'true';

        const routes = await FlightRoute.find(query).sort({ priority: -1, routeCode: 1 });
        res.status(200).json({ success: true, routes });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.updateRoute = async (req, res) => {
    try {
        const route = await FlightRoute.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!route) return res.status(404).json({ success: false, message: 'Route not found' });
        res.status(200).json({ success: true, message: 'Route updated successfully', route });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deleteRoute = async (req, res) => {
    try {
        const route = await FlightRoute.findByIdAndDelete(req.params.id);
        if (!route) return res.status(404).json({ success: false, message: 'Route not found' });
        res.status(200).json({ success: true, message: 'Route deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Manage Flight Inventory
 */
exports.addFlight = async (req, res) => {
    try {
        const data = { ...req.body };

        // 1. Resolve Airports from codes
        if (data.from && !data.fromAirport) {
            const airport = await Airport.findOne({ 
                $or: [{ iataCode: data.from.toUpperCase() }, { airportCode: data.from.toUpperCase() }] 
            });
            if (airport) data.fromAirport = airport._id;
        }
        if (data.to && !data.toAirport) {
            const airport = await Airport.findOne({ 
                $or: [{ iataCode: data.to.toUpperCase() }, { airportCode: data.to.toUpperCase() }] 
            });
            if (airport) data.toAirport = airport._id;
        }

        // 2. Map Airline
        if (data.airline && !data.airlineId) {
            data.airlineId = data.airline;
        }

        // 3. Map Prices
        if (data.finalPrice && !data.price) {
            data.price = data.finalPrice;
        }

        // 4. Map Status
        if (data.status === true || data.status === 'true') {
            data.status = 'Scheduled';
        } else if (data.status === false || data.status === 'false') {
            data.status = 'Cancelled';
        }

        // 5. Map Refundable
        if (data.refundable !== undefined) {
            data.isRefundable = data.refundable;
        }

        // 6. Handle Dates and Times
        if (data.departureDate && data.departureTime && typeof data.departureTime === 'string') {
            const depDate = dayjs(data.departureDate).startOf('day');
            const [hours, minutes] = data.departureTime.split(':').map(Number);
            data.departureTime = depDate.hour(hours).minute(minutes).toDate();
        }

        if (data.departureDate && data.arrivalTime && typeof data.arrivalTime === 'string') {
            const arrDate = dayjs(data.departureDate).startOf('day');
            const [hours, minutes] = data.arrivalTime.split(':').map(Number);
            let finalArrDate = arrDate.hour(hours).minute(minutes);
            
            // If arrival is earlier than departure, assume next day
            if (finalArrDate.isBefore(dayjs(data.departureTime))) {
                finalArrDate = finalArrDate.add(1, 'day');
            }
            data.arrivalTime = finalArrDate.toDate();
        }

        const flight = new Flight(data);
        await flight.save();
        res.status(201).json({ success: true, message: 'Flight added successfully', flight });
    } catch (error) {
        console.error("Add Flight Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getFlights = async (req, res) => {
    try {
        const { search, airline, status } = req.query;
        let query = {};
        
        if (search) {
            query.flightNumber = { $regex: search, $options: 'i' };
        }
        if (airline) query.airlineId = airline;
        
        // Handle status mapping from frontend (true/false strings)
        if (status !== undefined) {
            if (status === 'true') {
                query.status = 'Scheduled';
            } else if (status === 'false') {
                query.status = 'Cancelled';
            } else {
                query.status = status;
            }
        }

        const flights = await Flight.find(query)
            .populate('airlineId', 'name airlineName logo')
            .populate('fromAirport', 'airportName airportCode iataCode city')
            .populate('toAirport', 'airportName airportCode iataCode city')
            .sort({ departureTime: -1 }); // Show newest first
            
        res.status(200).json({ success: true, flights });
    } catch (error) {
        console.error("Get Flights Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.updateFlight = async (req, res) => {
    try {
        const data = { ...req.body };

        // 1. Resolve Airports from codes
        if (data.from && !data.fromAirport) {
            const airport = await Airport.findOne({ 
                $or: [{ iataCode: data.from.toUpperCase() }, { airportCode: data.from.toUpperCase() }] 
            });
            if (airport) data.fromAirport = airport._id;
        }
        if (data.to && !data.toAirport) {
            const airport = await Airport.findOne({ 
                $or: [{ iataCode: data.to.toUpperCase() }, { airportCode: data.to.toUpperCase() }] 
            });
            if (airport) data.toAirport = airport._id;
        }

        // 2. Map Airline
        if (data.airline && !data.airlineId) {
            data.airlineId = data.airline;
        }

        // 3. Map Prices
        if (data.finalPrice && !data.price) {
            data.price = data.finalPrice;
        }

        // 4. Map Status
        if (data.status === true || data.status === 'true') {
            data.status = 'Scheduled';
        } else if (data.status === false || data.status === 'false') {
            data.status = 'Cancelled';
        }

        // 5. Map Refundable
        if (data.refundable !== undefined) {
            data.isRefundable = data.refundable;
        }

        // 6. Handle Dates and Times
        if (data.departureDate && data.departureTime && typeof data.departureTime === 'string') {
            const depDate = dayjs(data.departureDate).startOf('day');
            const [hours, minutes] = data.departureTime.split(':').map(Number);
            data.departureTime = depDate.hour(hours).minute(minutes).toDate();
        }

        if (data.departureDate && data.arrivalTime && typeof data.arrivalTime === 'string') {
            const arrDate = dayjs(data.departureDate).startOf('day');
            const [hours, minutes] = data.arrivalTime.split(':').map(Number);
            let finalArrDate = arrDate.hour(hours).minute(minutes);
            
            if (finalArrDate.isBefore(dayjs(data.departureTime))) {
                finalArrDate = finalArrDate.add(1, 'day');
            }
            data.arrivalTime = finalArrDate.toDate();
        }

        const flight = await Flight.findByIdAndUpdate(req.params.id, data, { new: true });
        if (!flight) return res.status(404).json({ success: false, message: 'Flight not found' });
        res.status(200).json({ success: true, message: 'Flight updated successfully', flight });
    } catch (error) {
        console.error("Update Flight Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deleteFlight = async (req, res) => {
    try {
        const flight = await Flight.findByIdAndDelete(req.params.id);
        if (!flight) return res.status(404).json({ success: false, message: 'Flight not found' });
        res.status(200).json({ success: true, message: 'Flight removed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Pricing & Commission Engine
 */
exports.addPricingRule = async (req, res) => {
    try {
        const rule = new FlightPricingRule(req.body);
        await rule.save();
        res.status(201).json({ success: true, message: 'Pricing rule added successfully', rule });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getPricingRules = async (req, res) => {
    try {
        const rules = await FlightPricingRule.find()
            .populate('airline', 'name logo')
            .sort({ priority: -1, createdAt: -1 });
        res.status(200).json({ success: true, rules });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.updatePricingRule = async (req, res) => {
    try {
        const rule = await FlightPricingRule.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!rule) return res.status(404).json({ success: false, message: 'Pricing rule not found' });
        res.status(200).json({ success: true, message: 'Pricing rule updated', rule });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deletePricingRule = async (req, res) => {
    try {
        const rule = await FlightPricingRule.findByIdAndDelete(req.params.id);
        if (!rule) return res.status(404).json({ success: false, message: 'Pricing rule not found' });
        res.status(200).json({ success: true, message: 'Pricing rule deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Flight Dashboard Stats
 */
exports.getDashboardStats = async (req, res) => {
    try {
        const totalBookings = await FlightBooking.countDocuments();
        const activeFlights = await Flight.countDocuments({ status: 'Scheduled' });
        
        // Revenue calculation
        const revenueResult = await FlightBooking.aggregate([
            { $match: { paymentStatus: 'PAID' } },
            { $group: { _id: null, total: { $sum: '$fareDetails.totalAmount' } } }
        ]);
        const totalRevenue = revenueResult[0]?.total || 0;

        // Cancellation rate
        const cancelledBookings = await FlightBooking.countDocuments({ bookingStatus: 'CANCELLED' });
        const cancellationRate = totalBookings > 0 ? ((cancelledBookings / totalBookings) * 100).toFixed(1) : 0;

        // Last 7 days trend
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const trend = await FlightBooking.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            { $group: { 
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                bookings: { $sum: 1 },
                revenue: { $sum: "$fareDetails.totalAmount" }
            }},
            { $sort: { "_id": 1 } }
        ]);

        res.status(200).json({ 
            success: true, 
            stats: { totalBookings, totalRevenue, activeFlights, cancellationRate },
            trend 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Booking Management
 */
exports.getAllBookings = async (req, res) => {
    try {
        const { search, status, airline, date } = req.query;
        let query = {};
        
        if (status) query.bookingStatus = status;
        if (airline) query['flightDetails.airline'] = airline;
        if (search) {
            query.$or = [
                { pnr: { $regex: search, $options: 'i' } },
                { bookingId: { $regex: search, $options: 'i' } },
                { 'contactDetails.email': { $regex: search, $options: 'i' } }
            ];
        }

        const bookings = await FlightBooking.find(query)
            .populate('userId', 'name email mobile')
            .sort({ createdAt: -1 });
            
        res.status(200).json({ success: true, bookings });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Refund Management
 */
exports.getRefunds = async (req, res) => {
    try {
        const refunds = await FlightRefund.find()
            .populate('userId', 'name email')
            .populate('bookingId', 'pnr bookingId')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, refunds });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.updateRefundStatus = async (req, res) => {
    try {
        const { status, adminRemark } = req.body;
        const refund = await FlightRefund.findByIdAndUpdate(
            req.params.id, 
            { status, adminRemark, processedDate: status === 'Approved' ? new Date() : null },
            { new: true }
        );
        res.status(200).json({ success: true, message: 'Refund status updated', refund });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Support Ticket Management
 */
exports.getTickets = async (req, res) => {
    try {
        const tickets = await FlightSupportTicket.find()
            .populate('userId', 'name email')
            .populate('bookingId', 'pnr')
            .populate('assignedTo', 'name')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, tickets });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.updateTicket = async (req, res) => {
    try {
        const ticket = await FlightSupportTicket.findByIdAndUpdate(
            req.params.id, 
            { ...req.body, updatedAt: new Date() },
            { new: true }
        );
        res.status(200).json({ success: true, message: 'Ticket updated', ticket });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Reports & Analytics
 */
exports.getReports = async (req, res) => {
    try {
        const { startDate, endDate, type } = req.query;
        let dateQuery = {};
        if (startDate && endDate) {
            dateQuery = { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } };
        }

        const reports = await FlightBooking.aggregate([
            { $match: dateQuery },
            { $group: {
                _id: type === 'airline' ? "$flightDetails.airline" : "$flightDetails.routeCode",
                totalBookings: { $sum: 1 },
                totalRevenue: { $sum: "$fareDetails.totalAmount" },
                cancelledBookings: { $sum: { $cond: [{ $eq: ["$bookingStatus", "CANCELLED"] }, 1, 0] } }
            }},
            { $sort: { totalRevenue: -1 } }
        ]);

        res.status(200).json({ success: true, reports });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
