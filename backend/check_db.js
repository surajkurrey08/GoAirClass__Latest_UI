const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const Train = require('./models/train/Train');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const trains = await Train.find();
        console.log('Train Count:', trains.length);
        if (trains.length > 0) {
            console.log('Sample Train:', JSON.stringify(trains[0], null, 2));
        } else {
            console.log('No trains found in the database.');
        }

        await mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err);
    }
}

check();
