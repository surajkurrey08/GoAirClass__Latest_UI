const Flight = require('../../models/flight/flight.model');
const Airport = require('../../models/flight/airport.model');
const FlightSchedule = require('../../models/flight/flightSchedule.model');
const FlightInventory = require('../../models/flight/flightInventory.model');
const dayjs = require('dayjs');

const searchFlights = async (req, res) => {
    try {
        const { from, to, date, minPrice, maxPrice, stops, airlines, departureTime, refundable, budget } = { ...req.query, ...req.body };
        
        // Use budget as maxPrice if provided
        const effectiveMaxPrice = budget || maxPrice;

        // 1. Resolve Airports
        const fromAirport = await Airport.findOne({ 
            $or: [{ iataCode: from?.toUpperCase() }, { airportCode: from?.toUpperCase() }] 
        });
        const toAirport = await Airport.findOne({ 
            $or: [{ iataCode: to?.toUpperCase() }, { airportCode: to?.toUpperCase() }] 
        });

        if (!fromAirport || !toAirport) {
            return res.json({ success: true, flights: [], message: "Airports not found" });
        }

        // 2. Build Query for Flight Model
        const query = {
            fromAirport: fromAirport._id,
            toAirport: toAirport._id,
            status: 'Scheduled'
        };

        if (date) {
            const searchDate = dayjs(date).startOf('day').toDate();
            const nextDate = dayjs(date).endOf('day').toDate();
            query.departureTime = { $gte: searchDate, $lte: nextDate };
        }

        // Apply Advanced Filters
        if (minPrice !== undefined || effectiveMaxPrice !== undefined) {
            query.price = {};
            if (minPrice !== undefined && minPrice !== '') query.price.$gte = Number(minPrice);
            if (effectiveMaxPrice !== undefined && effectiveMaxPrice !== '') query.price.$lte = Number(effectiveMaxPrice);
        }

        if (stops && stops.length > 0) {
            const stopList = Array.isArray(stops) ? stops : [stops];
            query.stops = { $in: stopList };
        }

        if (airlines && airlines.length > 0) {
            const airlineList = Array.isArray(airlines) ? airlines : [airlines];
            // Find airlines by name or code to get their IDs
            const airlineDocs = await Airline.find({
                $or: [
                    { name: { $in: airlineList } },
                    { airlineName: { $in: airlineList } },
                    { iataCode: { $in: airlineList } },
                    { airlineCode: { $in: airlineList } }
                ]
            });
            const airlineIds = airlineDocs.map(a => a._id);
            query.airlineId = { $in: airlineIds };
        }

        if (refundable === 'true') {
            query.isRefundable = true;
        }

        if (departureTime && departureTime.length > 0) {
            const timeList = Array.isArray(departureTime) ? departureTime : [departureTime];
            const timeConditions = [];

            // Since departureTime in Flight model is a Date, we need to use aggregation or extraction
            // For now, we'll use a regex-like approach on the formatted time if possible, 
            // or just use $expr to extract hours.
            // Simple approach: filter after fetch or use $expr
        }

        // 3. Find flights and populate
        let flightsData = await Flight.find(query)
            .populate('airlineId')
            .populate('fromAirport')
            .populate('toAirport')
            .sort({ price: 1 });

        // Filter by departure time slot if specified
        if (departureTime && departureTime.length > 0) {
            const timeList = Array.isArray(departureTime) ? departureTime : [departureTime];
            flightsData = flightsData.filter(f => {
                const hour = dayjs(f.departureTime).hour();
                if (timeList.includes('Early Morning') && hour >= 0 && hour < 6) return true;
                if (timeList.includes('Morning') && hour >= 6 && hour < 12) return true;
                if (timeList.includes('Afternoon') && hour >= 12 && hour < 18) return true;
                if (timeList.includes('Evening/Night') && hour >= 18 && hour < 24) return true;
                return false;
            });
        }

        // 4. Format for frontend
        const formattedFlights = flightsData.map(f => {
            return {
                _id: f._id,
                flightNumber: f.flightNumber || 'Unknown',
                airline: f.airlineId?.airlineName || f.airlineId?.name || 'Unknown Airline',
                logo: f.airlineId?.logo || '',
                from: f.fromAirport?.airportCode || f.fromAirport?.iataCode || from,
                to: f.toAirport?.airportCode || f.toAirport?.iataCode || to,
                departureTime: dayjs(f.departureTime).format('HH:mm'),
                arrivalTime: dayjs(f.arrivalTime).format('HH:mm'),
                departureDate: f.departureTime,
                duration: f.duration || '2h 0m',
                stops: f.stops || 'Non-Stop',
                price: f.price || 0,
                type: 'Economy',
                seats: f.availableSeats || 0,
                refundable: f.isRefundable,
                baggage: f.baggageInfo || { cabin: '7kg', checkin: '15kg' }
            };
        });

        res.json({ success: true, flights: formattedFlights });
    } catch (err) {
        console.error("Flight Search Error:", err);
        res.status(500).json({ success: false, error: err.message, flights: [] });
    }
};

const createFlight = async (req, res) => {
    try {
        const flight = new Flight(req.body);
        await flight.save();
        res.status(201).json({ success: true, flight });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const getFlights = async (req, res) => {
    try {
        const flights = await Flight.find()
            .populate('airlineId')
            .populate('fromAirport')
            .populate('toAirport')
            .sort({ createdAt: -1 });
        res.json({ success: true, flights });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const getFlightById = async (req, res) => {
    try {
        const flight = await Flight.findById(req.params.id)
            .populate('airlineId')
            .populate('fromAirport')
            .populate('toAirport');
        if (!flight) return res.status(404).json({ success: false, message: 'Flight not found' });
        res.json({ success: true, flight });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const updateFlight = async (req, res) => {
    try {
        const flight = await Flight.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!flight) return res.status(404).json({ success: false, message: 'Flight not found' });
        res.json({ success: true, flight });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const deleteFlight = async (req, res) => {
    try {
        await Flight.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Flight deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const createFlightSchedule = async (req, res) => {
    try {
        const schedule = new FlightSchedule(req.body);
        await schedule.save();

        // Trigger generation
        const flights = await generateFlightsFromSchedule(schedule);

        res.status(201).json({
            success: true,
            message: `Schedule created and ${flights.length} flights generated.`,
            schedule,
            generatedCount: flights.length
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const generateFlightsFromSchedule = async (schedule) => {
    const flights = [];
    let current = dayjs(schedule.startDate);
    const end = dayjs(schedule.endDate);

    while (current.isBefore(end) || current.isSame(end, 'day')) {
        const dayOfWeek = current.day(); // 0-6
        if (schedule.operatingDays.includes(dayOfWeek)) {
            // Generate flight for this date
            const departureDateTime = current
                .hour(parseInt(schedule.departureTime.split(':')[0]))
                .minute(parseInt(schedule.departureTime.split(':')[1]))
                .toDate();

            const arrivalDateTime = dayjs(departureDateTime)
                .add(parseDuration(schedule.duration), 'minute')
                .toDate();

            const flight = new Flight({
                flightNumber: schedule.flightNumber,
                airlineId: schedule.airlineId,
                fromAirport: schedule.fromAirport,
                toAirport: schedule.toAirport,
                departureTime: departureDateTime,
                arrivalTime: arrivalDateTime,
                duration: schedule.duration,
                aircraftType: schedule.aircraftType,
                scheduleId: schedule._id,
                configuration: schedule.configuration,
                // These are legacy fields but we'll populate them for compatibility
                totalSeats: schedule.configuration.economy.seats + schedule.configuration.business.seats,
                availableSeats: schedule.configuration.economy.seats + schedule.configuration.business.seats,
                price: schedule.configuration.economy.price,
                status: 'Scheduled'
            });

            flights.push(flight);
        }
        current = current.add(1, 'day');
    }

    if (flights.length > 0) {
        await Flight.insertMany(flights);
    }
    return flights;
};

// Helper to parse "2H 30M" or "150" into minutes
const parseDuration = (dur) => {
    if (typeof dur === 'number') return dur;
    if (!isNaN(dur)) return parseInt(dur);

    let minutes = 0;
    const hoursMatch = dur.match(/(\d+)H/i);
    const minsMatch = dur.match(/(\d+)M/i);
    if (hoursMatch) minutes += parseInt(hoursMatch[1]) * 60;
    if (minsMatch) minutes += parseInt(minsMatch[1]);

    return minutes || 120; // Default 2 hours if parsing fails
};

// Basic in-memory cache for fares
const fareCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getFlightFares = async (req, res) => {
    try {
        const { from, to, date } = req.query;
        const cacheKey = `${from}-${to}-${date}`;

        // Check Cache
        if (fareCache.has(cacheKey)) {
            const cached = fareCache.get(cacheKey);
            if (Date.now() - cached.timestamp < CACHE_TTL) {
                return res.json({ success: true, fares: cached.data, cached: true });
            }
            fareCache.delete(cacheKey);
        }

        // 1. Find Airport IDs
        const fromAirportDoc = await Airport.findOne({ airportCode: from?.toUpperCase() });
        const toAirportDoc = await Airport.findOne({ airportCode: to?.toUpperCase() });

        if (!fromAirportDoc || !toAirportDoc) {
            return res.json({ success: true, fares: [] });
        }

        // 2. Build Date Range (today to 10 days forward or around requested date)
        const today = dayjs().startOf('day');
        const reqDate = date ? dayjs(date) : today;
        
        // Ensure startDate is NOT in the past
        let startDate = reqDate.subtract(2, 'day');
        if (startDate.isBefore(today)) {
            startDate = today;
        }
        
        const endDate = startDate.add(10, 'day').endOf('day').toDate();
        const startDateTime = startDate.toDate();

        // 3. Aggregate min price per day
        const fares = await Flight.aggregate([
            {
                $match: {
                    fromAirport: fromAirportDoc._id,
                    toAirport: toAirportDoc._id,
                    status: { $ne: 'Cancelled' },
                    departureTime: { $gte: startDateTime, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$departureTime" } },
                    price: { $min: "$price" }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    price: 1
                }
            },
            { $sort: { date: 1 } }
        ]);

        // Update Cache
        fareCache.set(cacheKey, { data: fares, timestamp: Date.now() });

        res.json({ success: true, fares });
    } catch (err) {
        console.error("Flight Fares Error:", err);
        res.status(500).json({ success: false, error: err.message, fares: [] });
    }
};

module.exports = {
    createFlight,
    searchFlights,
    getFlights,
    getFlightById,
    updateFlight,
    deleteFlight,
    createFlightSchedule,
    getFlightFares
};
