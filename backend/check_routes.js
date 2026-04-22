const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Train = require('./models/train/Train');
const TrainRoute = require('./models/train/TrainRoute');

async function checkRoutes() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const routes = await TrainRoute.find().populate('train', 'name number');
        console.log('Routes found:', routes.length);
        
        for (const r of routes) {
            console.log('Train:', r.train?.name, '(', r.train?.number, ')');
            console.log('Stops count:', r.stops?.length);
            if (r.stops) {
                for (const s of r.stops) {
                    // Populate station manually because it's an ID
                }
            }
        }

        await mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkRoutes();
