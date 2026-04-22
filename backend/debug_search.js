const mongoose = require('mongoose');
require('dotenv').config();

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const Station = mongoose.model('Station', new mongoose.Schema({ name: String, code: String, city: String }));
        const stations = await Station.find({ code: { $in: ['NDLS', 'MMCT'] } });
        console.log('Stations Found:', JSON.stringify(stations, null, 2));

        const Train = mongoose.model('Train', new mongoose.Schema({ name: String, number: String, status: String, runsOn: [String] }));
        const trains = await Train.find({ number: '12952' });
        console.log('Trains Found:', JSON.stringify(trains, null, 2));

        const TrainRoute = mongoose.model('TrainRoute', new mongoose.Schema({
            train: { type: mongoose.Schema.Types.ObjectId, ref: 'Train' },
            stops: [{ station: mongoose.Schema.Types.ObjectId, arrivalTime: String, departureTime: String }]
        }));
        const routes = await TrainRoute.find().populate('train');
        console.log('Routes Found:', routes.length);
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkData();
