const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Station = require('./models/train/Station');
const Train = require('./models/train/Train');
const TrainRoute = require('./models/train/TrainRoute');

async function search() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Find stations
        const fromStation = await Station.findOne({ 
            $or: [{ name: /New Delhi/i }, { code: /NDLS/i }] 
        });
        const toStation = await Station.findOne({ 
            $or: [{ name: /Mumbai/i }, { code: /MMCT/i }] 
        });

        console.log('From Station:', fromStation?.name, '(', fromStation?.code, ')');
        console.log('To Station:', toStation?.name, '(', toStation?.code, ')');

        if (!fromStation || !toStation) {
            console.log('One or both stations not found.');
            await mongoose.connection.close();
            return;
        }

        // 2. Find routes containing both stations in order
        // We need to look into TrainRoute.stops
        const routes = await TrainRoute.find({
            'stops.station': fromStation._id,
        }).populate('train', 'name number runsOn status');

        const matchingTrains = [];

        for (const route of routes) {
            const fromIdx = route.stops.findIndex(s => s.station.toString() === fromStation._id.toString());
            const toIdx = route.stops.findIndex(s => s.station.toString() === toStation._id.toString());

            if (fromIdx !== -1 && toIdx !== -1 && fromIdx < toIdx) {
                // Check if train runs on Wednesday (2026-03-18 is Wednesday)
                const date = new Date('2026-03-18');
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const dayName = days[date.getDay()];
                
                if (route.train.runsOn.includes(dayName) || route.train.runsOn.includes('Daily')) {
                    matchingTrains.push({
                        train: route.train,
                        fromStop: route.stops[fromIdx],
                        toStop: route.stops[toIdx]
                    });
                }
            }
        }

        console.log('Matching Trains Count:', matchingTrains.length);
        console.log('Results:', JSON.stringify(matchingTrains, null, 2));

        await mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err);
    }
}

search();
