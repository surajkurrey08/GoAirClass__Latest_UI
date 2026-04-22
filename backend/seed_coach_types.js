/**
 * Seed Coach Types — Run once to populate the CoachType master table
 * Usage: node seed_coach_types.js
 */
const mongoose = require('mongoose');
require('dotenv').config();

const CoachType = require('./models/train/CoachType');

const COACH_TYPES = [
    { name: '1A', fullName: 'First AC', defaultSeats: 24, icon: '💎', order: 1 },
    { name: '2A', fullName: 'Second AC', defaultSeats: 48, icon: '🛏️', order: 2 },
    { name: '3A', fullName: 'Third AC', defaultSeats: 64, icon: '🛌', order: 3 },
    { name: '3E', fullName: 'Third AC Economy', defaultSeats: 72, icon: '🛌', order: 4 },
    { name: 'SL', fullName: 'Sleeper', defaultSeats: 72, icon: '🚃', order: 5 },
    { name: 'CC', fullName: 'Chair Car', defaultSeats: 78, icon: '💺', order: 6 },
    { name: 'EC', fullName: 'Executive Chair Car', defaultSeats: 56, icon: '🪑', order: 7 },
    { name: '2S', fullName: 'Second Sitting', defaultSeats: 108, icon: '🪑', order: 8 }
];

const seedCoachTypes = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/goairclass';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        for (const ct of COACH_TYPES) {
            const existing = await CoachType.findOne({ name: ct.name });
            if (existing) {
                // Update existing
                await CoachType.updateOne({ name: ct.name }, ct);
                console.log(`🔄 Updated: ${ct.name} (${ct.fullName})`);
            } else {
                await CoachType.create(ct);
                console.log(`✅ Created: ${ct.name} (${ct.fullName})`);
            }
        }

        console.log('\n🎉 Coach types seeded successfully!');
        const all = await CoachType.find().sort({ order: 1 });
        console.table(all.map(c => ({ Name: c.name, Full: c.fullName, Seats: c.defaultSeats })));

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    }
};

seedCoachTypes();
