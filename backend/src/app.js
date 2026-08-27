require('./config/env');

const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const Coupon = require('./legacy/models/Coupon');

const b2cRoutes = require('./b2c/b2c.routes');
const b2bRoutes = require('./b2b/b2b.routes');
const adminRoutes = require('./admin/routes/admin.routes');
const adminAgencyRoutes = require('./admin/routes/agency.routes');
const busRequestRoutes = require('./admin/routes/bus-request.routes');
const superAdminTrainRoutes = require('./admin/routes/super-admin-train.routes');

const heroImageRoutes = require('./legacy/routes/heroImages');
const operatorRoutes = require('./legacy/routes/operatorRoutes');
const busRoutes = require('./legacy/routes/busRoutes');
const routeRoutes = require('./legacy/routes/routeRoutes');
const scheduleRoutes = require('./legacy/routes/scheduleRoutes');
const couponRoutes = require('./legacy/routes/couponRoutes');
const cityRoutes = require('./legacy/routes/cityRoutes');
const trainRoutes = require('./legacy/routes/trainRoutes');
const coachRoutes = require('./legacy/routes/coachRoutes');
const commissionRoutes = require('./legacy/routes/commissionRoutes');
const pricingRoutes = require('./legacy/routes/pricingRoutes');
const assetRoutes = require('./legacy/routes/assetRoutes');
const adRoutes = require('./legacy/routes/adRoutes');
const bannerRoutes = require('./legacy/routes/bannerRoutes');
const userDirectoryRoutes = require('./legacy/routes/userDirectoryRoutes');
const dashboardRoutes = require('./legacy/routes/dashboardRoutes');
const reviewRoutes = require('./legacy/routes/reviewRoutes');
const busOperatorRoutes = require('./legacy/routes/busOperatorRoutes');
const destinationRoutes = require('./legacy/routes/destinationRoutes');
const videoContentRoutes = require('./legacy/routes/videoContentRoutes');
const testimonialRoutes = require('./legacy/routes/testimonialRoutes');
const inquiryRoutes = require('./legacy/routes/inquiryRoutes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/content', videoContentRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/inquiries', inquiryRoutes);

app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    if (req.body && Object.keys(req.body).length) {
        console.log('Request Body:', JSON.stringify(req.body, null, 2));
    }
    next();
});

app.use('/uploads', express.static('uploads'));
app.use('/uploads/destinations', express.static('uploads/destinations'));
app.use('/uploads/videos', express.static('uploads/videos'));
app.use('/uploads/reviews', express.static('uploads/reviews'));
app.use('/uploads/b2b/documents', express.static('uploads/b2b/documents'));

app.use('/api', b2cRoutes);
app.use('/api/b2b', b2bRoutes);
app.use('/api/operators', operatorRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/bus', busRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/cities', cityRoutes);

app.use('/api/admin', adminRoutes);
app.use('/api/admin/agencies', adminAgencyRoutes);
app.use('/api/admin/bus-requests', busRequestRoutes);
app.use('/api/admin/train', superAdminTrainRoutes);
app.use('/api/trains', trainRoutes);
app.use('/api/train-bookings', trainRoutes);
app.use('/api/pnr', trainRoutes);
app.use('/api', coachRoutes);
app.use('/api/bus-operator', busOperatorRoutes);

app.use('/api/commission', commissionRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/banner', bannerRoutes);
app.use('/api/user-directory', userDirectoryRoutes);
app.use('/api/operator-mgmt', operatorRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/hero-images', heroImageRoutes);
app.use('/uploads/banners', express.static('uploads/banners'));

app.get('/', (req, res) => {
    res.send('API Working...');
});

cron.schedule('0 * * * *', async () => {
    try {
        const result = await Coupon.updateMany(
            { validTill: { $lt: new Date() }, status: 'Active' },
            { status: 'Expired' }
        );
        if (result.modifiedCount > 0) {
            console.log(`[Cron] Expired ${result.modifiedCount} coupons.`);
        }
    } catch (err) {
        console.error('[Cron] Error expiring coupons:', err);
    }
});

cron.schedule('0 3 * * 0', async () => {
    try {
        const { syncAllHotelsCron } = require('./b2c/hotels/hotel.controller');
        await syncAllHotelsCron();
    } catch (err) {
        console.error('[Cron] Error running hotel sync job:', err);
    }
});

module.exports = app;
