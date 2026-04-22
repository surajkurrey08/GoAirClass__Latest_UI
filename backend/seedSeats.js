const mongoose = require('mongoose');
const TrainSeat = require('./models/train/Seat');
const Train = require('./models/train/Train');
require('dotenv').config();

const seedSeats = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const trains = await Train.find({ status: 'Active' });
        if (trains.length === 0) {
            console.log('No active trains found. Please create a train first.');
            process.exit(1);
        }

        const date = '2026-03-25'; // Test date
        const coachTypes = [
            { type: '1A', coaches: ['H1'], seats: 24, price: 2500 },
            { type: '2A', coaches: ['A1', 'A2'], seats: 48, price: 1800 },
            { type: '3A', coaches: ['B1', 'B2', 'B3'], seats: 64, price: 1200 },
            { type: '3E', coaches: ['M1'], seats: 72, price: 1000 },
            { type: 'SL', coaches: ['S1', 'S2', 'S3', 'S4', 'S5'], seats: 72, price: 500 },
            { type: 'EC', coaches: ['E1'], seats: 56, price: 2200 }
        ];

        const berthTypes = ['LB', 'MB', 'UB', 'LB', 'MB', 'UB', 'SL', 'SU'];
        
        for (const train of trains) {
            const seatsToCreate = [];
            console.log(`Processing Train: ${train.name} (${train.number})`);

            for (const ct of coachTypes) {
                for (const coachNum of ct.coaches) {
                    for (let i = 1; i <= ct.seats; i++) {
                        seatsToCreate.push({
                            trainId: train._id,
                            coachType: ct.type,
                            coachNumber: coachNum,
                            seatNumber: i,
                            berthType: berthTypes[(i - 1) % 8],
                            status: 'AVAILABLE',
                            date: date,
                            price: ct.price
                        });
                    }
                }
            }

            console.log(`  Clearing existing seats for ${train.name} on ${date}...`);
            await TrainSeat.deleteMany({ trainId: train._id, date: date });

            console.log(`  Seeding ${seatsToCreate.length} seats...`);
            await TrainSeat.insertMany(seatsToCreate);
        }

        console.log('Seeding completed successfully for all trains!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding seats:', error);
        process.exit(1);
    }
};

seedSeats();
