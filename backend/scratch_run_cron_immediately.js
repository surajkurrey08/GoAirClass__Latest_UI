const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const { syncAllHotelsCron } = require('./controllers/hotel/hotelController');

const testCronImmediately = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected successfully.');

        console.log('Testing Automatic Cron Job functionality...');
        
        // Simulating the cron job execution immediately
        const { syncIncrementalUpdates } = require('./controllers/hotel/hotelController');
        
        // Re-export or import helper function indirectly via calling syncIncrementalUpdates manually
        // We will call the controller directly using a mock request/response object
        const mockReq = {
            query: {
                lastUpdatedAt: "1753164000", // postman tested value
                pageSize: "2000"
            }
        };

        const mockRes = {
            json: (data) => {
                console.log('Mock Response Received:');
                console.log(JSON.stringify(data, null, 2).substring(0, 1000));
                mongoose.disconnect();
            },
            status: (code) => {
                console.log(`Mock Status set to: ${code}`);
                return mockRes;
            }
        };

        await syncIncrementalUpdates(mockReq, mockRes);
    } catch (e) {
        console.error('Test Failed:', e.message);
        mongoose.disconnect();
    }
};

testCronImmediately();
