const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Station = require('./models/train/Station');
const Train = require('./models/train/Train');
const TrainRoute = require('./models/train/TrainRoute');

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const ndls = await Station.findOne({ code: 'NDLS' });
        const mmct = await Station.findOne({ code: 'MMCT' });

        if (!ndls || !mmct) {
            console.log('Stations not found.');
            await mongoose.connection.close();
            return;
        }

        // Create Train 12952 (NDLS to MMCT)
        let train = await Train.findOne({ number: '12952' });
        if (!train) {
            train = new Train({
                name: 'Rajdhani Express',
                number: '12952',
                type: 'Rajdhani',
                source: ndls._id,
                destination: mmct._id,
                runsOn: ['Daily'],
                status: 'Active'
            });
            await train.save();
            console.log('Created Train 12952');
        }

        // Create Route
        let route = await TrainRoute.findOne({ train: train._id });
        if (!route) {
            route = new TrainRoute({
                train: train._id,
                stops: [
                    {
                        station: ndls._id,
                        arrivalTime: '',
                        departureTime: '16:55',
                        stopNumber: 1,
                        distance: 0
                    },
                    {
                        station: mmct._id,
                        arrivalTime: '08:35',
                        departureTime: '',
                        stopNumber: 2,
                        distance: 1386
                    }
                ]
            });
            await route.save();
            console.log('Created Route for 12952');
        }

        await mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err);
    }
}

seed();
