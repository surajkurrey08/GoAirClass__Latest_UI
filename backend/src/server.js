require('./config/env');

const app = require('./app');
const connectDatabase = require('./config/db');
const seedSuperAdmin = require('./config/seed');

process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION (server kept alive):', err.message);
    console.error(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION (server kept alive):', reason);
});

connectDatabase()
    .then(async () => {
        console.log('MongoDB Connected Successfully');
        await seedSuperAdmin();

        const { initReminderCron } = require('./core/notifications/reminderCron');
        initReminderCron();

        const { syncAllHotelsCron } = require('./b2c/hotels/hotel.controller');
        syncAllHotelsCron();

        const port = process.env.PORT || 5000;
        const server = app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });

        server.timeout = 600000;
        server.keepAliveTimeout = 600000;
    })
    .catch((err) => {
        console.error('MongoDB Connection Error:', err.message);
        console.log('-----------------------------------------');
        console.log('TIP: If this fails, check your internet or white-list your IP in Atlas.');
        console.log('-----------------------------------------');
    });
