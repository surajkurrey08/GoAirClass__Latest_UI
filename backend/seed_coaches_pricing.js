const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Train = require('./models/train/Train');
const Coach = require('./models/train/Coach');
const TrainPricing = require('./models/train/TrainPricing');

async function seedDetails() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const train = await Train.findOne({ number: '12952' });
        if (!train) {
            console.log('Train 12952 not found.');
            await mongoose.connection.close();
            return;
        }

        // 1. Create Coaches
        const coachTypes = [
            { type: '1A', num: 'H1', total: 22, avail: 18 },
            { type: '2A', num: 'A1', total: 48, avail: 30 },
            { type: '3A', num: 'B1', total: 72, avail: 65 },
            { type: 'SL', num: 'S1', total: 72, avail: 12 }
        ];

        for (const ct of coachTypes) {
            let coach = await Coach.findOne({ train: train._id, coachType: ct.type });
            if (!coach) {
                coach = new Coach({
                    train: train._id,
                    coachType: ct.type,
                    coachNumber: ct.num,
                    totalSeats: ct.total,
                    availableSeats: ct.avail
                });
                await coach.save();
                console.log(`Created Coach ${ct.type}`);
            }
        }

        // 2. Create Pricing
        let pricing = await TrainPricing.findOne({ train_id: train._id });
        if (!pricing) {
            pricing = new TrainPricing({
                train_id: train._id,
                base_price: 1500,
                dynamic_multiplier: 1.2
            });
            await pricing.save();
            console.log('Created Pricing for 12952');
        }

        await mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err);
    }
}

seedDetails();
