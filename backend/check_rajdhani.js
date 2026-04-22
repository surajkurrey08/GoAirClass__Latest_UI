const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Station = require('./models/train/Station');
const Train = require('./models/train/Train');

async function checkTrain() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const train = await Train.findOne({ number: '12951' }).populate('source').populate('destination');
        if (train) {
            console.log('Train:', train.name);
            console.log('Source:', train.source?.name, '(', train.source?.code, ')');
            console.log('Destination:', train.destination?.name, '(', train.destination?.code, ')');
        } else {
            console.log('Train 12951 not found.');
        }

        await mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkTrain();
