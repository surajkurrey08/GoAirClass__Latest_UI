const mongoose = require('mongoose');
const Bus = require('./models/Bus');
const Operator = require('./models/Operator');
const BusType = require('./models/BusType');
require('dotenv').config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // 1. Create/Find Operator
        let operator = await Operator.findOne({ email: 'test_operator@goairclass.com' });
        if (!operator) {
            operator = new Operator({
                name: 'Test Operator',
                companyName: 'GoAir Express',
                email: 'test_operator@goairclass.com',
                password: 'password123',
                contactNumber: '1234567890',
                status: 'Active'
            });
            await operator.save();
        }

        // 2. Create Bus Types
        const types = [
            { name: 'AC Sleeper', seatLayout: '2+1' },
            { name: 'Non-AC Seater', seatLayout: '2+2' },
            { name: 'AC Luxury Seater', seatLayout: '2+2' }
        ];
        for (const t of types) {
            await BusType.findOneAndUpdate({ name: t.name }, t, { upsert: true });
        }

        // 3. Clear existing seed buses (optional)
        await Bus.deleteMany({ busName: { $regex: 'Seed Bus' } });

        // 4. Create Buses for each status
        const buses = [
            { busName: 'Seed Bus Active 1', busNumber: 'MH-01-A-0001', status: 'active', busType: 'AC Sleeper' },
            { busName: 'Seed Bus Active 2', busNumber: 'MH-01-A-0002', status: 'active', busType: 'Non-AC Seater' },
            { busName: 'Seed Bus Pending 1', busNumber: 'MH-01-P-0001', status: 'pending', busType: 'AC Sleeper' },
            { busName: 'Seed Bus Pending 2', busNumber: 'MH-01-P-0002', status: 'pending', busType: 'AC Luxury Seater' },
            { busName: 'Seed Bus Suspended', busNumber: 'MH-01-S-0001', status: 'suspended', busType: 'Non-AC Seater' },
            { busName: 'Seed Bus Rejected', busNumber: 'MH-01-R-0001', status: 'rejected', busType: 'AC Sleeper' }
        ];

        for (const b of buses) {
            const newBus = new Bus({
                ...b,
                operator: operator._id,
                totalSeats: 36,
                amenities: ['WiFi', 'Water', 'Blanket']
            });
            await newBus.save();
        }

        console.log('Seeding completed successfully!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seed();
