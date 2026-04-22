require('dotenv').config();
const mongoose = require('mongoose');
const Train = require('./models/train/Train');
const TrainRoute = require('./models/train/TrainRoute');
const Station = require('./models/train/Station');

async function run() {
    console.log('Connecting to:', process.env.MONGO_URI?.replace(/\/\/[^:]+:[^@]+@/, '//*****:*****@'));
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('✅ Connected to MongoDB\n');

    // Find a real train
    const train = await Train.findOne();
    if (!train) { console.log('❌ No trains found in DB'); process.exit(1); }
    console.log('Train found:', train._id, train.name);

    // Find 2 real stations
    const stations = await Station.find().limit(2);
    if (stations.length < 2) { console.log('❌ Need at least 2 stations'); process.exit(1); }
    console.log('Stations found:', stations.map(s => s.name + ' (' + s._id + ')'));

    // Try saving a route exactly as the frontend does
    const payload_stops = [
        { station: stations[0]._id, arrivalTime: '', departureTime: '10:00', stopNumber: 1, distance: 0 },
        { station: stations[1]._id, arrivalTime: '11:00', departureTime: '', stopNumber: 2, distance: 50 }
    ];

    console.log('\nAttempting to save route...');
    let route = await TrainRoute.findOne({ train: train._id });
    if (route) {
        route.stops = payload_stops;
        await route.save();
        console.log('✅ Route UPDATED, id:', route._id);
    } else {
        route = await TrainRoute.create({ train: train._id, stops: payload_stops });
        console.log('✅ Route CREATED, id:', route._id);
    }

    const saved = await TrainRoute.findOne({ train: train._id }).populate('stops.station');
    console.log('\nSaved route stops:');
    saved.stops.forEach(s => console.log(' -', s.station?.name, '| arr:', s.arrivalTime, '| dep:', s.departureTime));

    await mongoose.disconnect();
    console.log('\n✅ Test complete — route saved successfully to DB!');
}

run().catch(e => {
    console.error('\n❌ ERROR:', e.message);
    console.error(e.stack);
    process.exit(1);
});
