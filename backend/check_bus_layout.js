const mongoose = require('mongoose');
const Bus = require('./backend/models/Bus');
require('dotenv').config({ path: './backend/.env' });

async function checkBus() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const buses = await Bus.find({ busType: /sleeper/i }).limit(5);
        buses.forEach(bus => {
            console.log(`Bus: ${bus.busName} (${bus._id})`);
            console.log('Layout (first 5 seats):');
            bus.seatLayout.slice(0, 5).forEach(s => {
                console.log(`  Seat ${s.seatNo}: Row ${s.row}, Col ${s.col}, Side ${s.side}`);
            });
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkBus();
