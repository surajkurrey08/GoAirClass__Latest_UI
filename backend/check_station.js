const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Station = require('./models/train/Station');

async function testStationModel() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const testCode = 'TEST' + Math.floor(Math.random() * 1000);
        console.log(`Attempting to save station with code: ${testCode}`);

        const station = new Station({
            name: 'Test Station',
            code: testCode,
            city: 'Test City',
            state: 'Test State',
            latitude: 28.6139,
            longitude: 77.2090,
            status: 'active'
        });

        const saved = await station.save();
        console.log('✅ Station saved successfully:', saved._id);

        // Try duplicate
        console.log('Attempting to save duplicate code...');
        const duplicate = new Station({
            name: 'Duplicate Station',
            code: testCode,
            city: 'Test City',
            state: 'Test State',
            latitude: 28.6139,
            longitude: 77.2090
        });




        
        try {
            await duplicate.save();
            console.log('❌ Error: Duplicate save should have failed!');
        } catch (dupErr) {
            console.log('✅ Duplicate save failed as expected:', dupErr.message);
        }

        // Cleanup
        await Station.deleteOne({ _id: saved._id });
        console.log('Test station cleaned up.');

        await mongoose.connection.close();
    } catch (err) {
        console.error('❌ Mongoose/Model Error:', err);
    }
}

testStationModel();
