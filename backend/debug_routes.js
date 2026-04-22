const mongoose = require('mongoose');
require('dotenv').config();

async function checkRoutes() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const Station = mongoose.model('Station', new mongoose.Schema({ name: String, code: String }));
        const Train = mongoose.model('Train', new mongoose.Schema({ name: String, number: String, status: String, runsOn: [String] }));
        const TrainRoute = mongoose.model('TrainRoute', new mongoose.Schema({
            train: { type: mongoose.Schema.Types.ObjectId, ref: 'Train' },
            stops: [{ station: { type: mongoose.Schema.Types.ObjectId, ref: 'Station' }, arrivalTime: String, departureTime: String }]
        }));

        const routes = await TrainRoute.find().populate('train').populate('stops.station');
        console.log('Total Routes:', routes.length);
        
        for (const route of routes) {
            console.log(`Route for Train: ${route.train?.name} (${route.train?.number})`);
            console.log('Stops:', route.stops.map(s => `${s.station?.code} (${s.arrivalTime || 'Start'} -> ${s.departureTime || 'End'})`).join(' -> '));
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkRoutes();
