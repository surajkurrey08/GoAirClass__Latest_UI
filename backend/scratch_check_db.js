
const mongoose = require('mongoose');
require('dotenv').config();

async function mergeCollections() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection.db;
        
        const flights = await db.collection('flights').find({}).toArray();
        console.log(`Moving ${flights.length} flights to flightinventories...`);

        if (flights.length > 0) {
            for (const flight of flights) {
                // Check if already there (avoid duplicates)
                const existing = await db.collection('flightinventories').findOne({ _id: flight._id });
                if (!existing) {
                    await db.collection('flightinventories').insertOne(flight);
                }
            }
        }
        
        // Optionally drop the now redundant 'flights' collection
        console.log('Dropping redundant flights collection...');
        await db.collection('flights').drop();

        console.log('Merge complete. All data is now in flightinventories.');

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

mergeCollections();
