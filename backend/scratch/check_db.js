require('dotenv').config();
const mongoose = require('mongoose');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection.db;
        
        const bom = await db.collection('airports').findOne({ airportCode: 'BOM' });
        console.log('--- BOM AIRPORT ---');
        console.log(bom ? 'FOUND' : 'NOT FOUND');
        
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

check();
