const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const Coupon = require("./models/Coupon");

const heroImageRoutes = require('./routes/heroImages');


const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const operatorRoutes = require("./routes/operatorRoutes");
const busRoutes = require("./routes/busRoutes");
const routeRoutes = require("./routes/routeRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const couponRoutes = require("./routes/couponRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const cityRoutes = require("./routes/cityRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const trainRoutes = require("./routes/trainRoutes");
const superAdminTrainRoutes = require("./routes/superAdminTrainRoutes");
const coachRoutes = require("./routes/coachRoutes");
const commissionRoutes = require("./routes/commissionRoutes");
const pricingRoutes = require("./routes/pricingRoutes");
const assetRoutes = require("./routes/assetRoutes");
const adRoutes = require("./routes/adRoutes");
const bannerRoutes = require("./routes/bannerRoutes");
const userDirectoryRoutes = require("./routes/userDirectoryRoutes");
const operatorManagementRoutes = require("./routes/operatorRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const busRequestRoutes = require("./routes/busRequestRoutes");
const busOperatorRoutes = require("./routes/busOperatorRoutes");
const destinationRoutes = require("./routes/destinationRoutes");

// Hotel module routes
const hotelRoutes = require('./routes/hotel/hotelRoutes');
const roomRoutes = require('./routes/hotel/roomRoutes');
const hotelBookingRoutes = require('./routes/hotel/bookingRoutes');
const offerRoutes = require('./routes/hotel/offerRoutes');
const hotelOperatorRoutes = require('./routes/hotel/hotelOperatorRoutes');
const hotelCouponRoutes = require('./routes/hotel/hotelCouponRoutes');


// Hotel Operator Panel routes
const hotelOperatorAuthRoutes = require('./routes/hotel/hotelOperatorAuthRoutes');
const operatorHotelRoutes = require('./routes/hotel/operatorHotelRoutes');
const operatorRoomRoutes = require('./routes/hotel/operatorRoomRoutes');
const operatorBookingRoutes = require('./routes/hotel/operatorBookingRoutes');

// Flight module routes
const airportRoutes = require('./routes/flight/airport.routes');
const airlineRoutes = require('./routes/flight/airline.routes');
const flightRoutes = require('./routes/flight/flight.routes');
const flightBookingRoutes = require('./routes/flight/booking.routes');
const flightOfferRoutes = require('./routes/flight/offer.routes');
const flightSettingsRoutes = require('./routes/flight/settings.routes');
const flightDashboardRoutes = require('./routes/flight/dashboard.routes');
const passengerRoutes = require('./routes/flight/passenger.routes');
const flightSeatRoutes = require('./routes/flight/seat.routes');
const flightPaymentRoutes = require('./routes/flight/payment.routes');
const flightTicketRoutes = require('./routes/flight/ticket.routes');
const faresRoutes = require('./routes/flight/fares.routes');
const flightMealRoutes = require('./routes/flight/meal.routes');


const videoContentRoutes = require('./routes/videoContentRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/content', videoContentRoutes);
app.use('/api/testimonials', testimonialRoutes);

// Request logger - MUST be above other routes
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    if (req.body && Object.keys(req.body).length) {
        console.log("Request Body:", JSON.stringify(req.body, null, 2));
    }
    next();
});

app.use('/uploads', express.static('uploads'));
app.use('/uploads/destinations', express.static('uploads/destinations'));
app.use('/uploads/videos', express.static('uploads/videos'));
app.use('/uploads/reviews', express.static('uploads/reviews'));

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/operators", operatorRoutes);
app.use("/api/buses", busRoutes);
app.use("/api/bus", busRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/destinations", destinationRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/flights", require("./routes/flight/flightAdmin.routes"));
app.use("/api/admin/bus-requests", busRequestRoutes);
app.use("/api/admin/train", superAdminTrainRoutes);
app.use("/api/trains", trainRoutes);
app.use("/api/train-bookings", trainRoutes);
app.use("/api/pnr", trainRoutes);
app.use("/api", coachRoutes);
app.use("/api/bus-operator", busOperatorRoutes);

// Hotel module
app.use('/api/hotels', hotelRoutes);
app.use('/api/hotel-rooms', roomRoutes);
app.use('/api/hotel-bookings', hotelBookingRoutes);
app.use('/api/hotel-offers', offerRoutes);
app.use('/api/hotel-operators', hotelOperatorRoutes);
app.use('/api/hotel-coupons', hotelCouponRoutes);


// Hotel Operator Panel
app.use('/api/hotel-operator/auth', hotelOperatorAuthRoutes);
app.use('/api/hotel-operator/hotels', operatorHotelRoutes);
app.use('/api/hotel-operator/rooms', operatorRoomRoutes);
app.use('/api/hotel-operator/bookings', operatorBookingRoutes);

// Flight module
app.use('/api/airports', airportRoutes);
app.use('/api/airlines', airlineRoutes);
app.use('/api/flights/dashboard', flightDashboardRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/flight-bookings', flightBookingRoutes);
app.use('/api/flight-offers', flightOfferRoutes);
app.use('/api/flight-settings', flightSettingsRoutes);
app.use('/api/passengers', passengerRoutes);
app.use('/api/seats', flightSeatRoutes);
app.use('/api/flight-payments', flightPaymentRoutes);
app.use('/api/tickets', flightTicketRoutes);
app.use('/api/commission', commissionRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/banner', bannerRoutes);
app.use('/api/fares', faresRoutes);
app.use('/api/user-directory', userDirectoryRoutes);
app.use('/api/operator-mgmt', operatorManagementRoutes);
app.use('/api/meals', flightMealRoutes);
app.use('/api/seats-master', require('./routes/flight/seatMaster.routes'));
app.use('/api/baggage-mapping', require('./routes/flight/baggageMapping.routes'));
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/hero-images', heroImageRoutes);
app.use('/uploads/banners', require('express').static('uploads/banners'));
app.use('/uploads/meals', require('express').static('uploads/meals'));

app.get("/", (req, res) => {
    res.send("API Working...");
});

// Auto Expire Coupons Cron Job (Runs every hour)
cron.schedule("0 * * * *", async () => {
    try {
        const result = await Coupon.updateMany(
            { validTill: { $lt: new Date() }, status: "Active" },
            { status: "Expired" }
        );
        if (result.modifiedCount > 0) {
            console.log(`[Cron] Expired ${result.modifiedCount} coupons.`);
        }
    } catch (err) {
        console.error("[Cron] Error expiring coupons:", err);
    }
});

module.exports = app;