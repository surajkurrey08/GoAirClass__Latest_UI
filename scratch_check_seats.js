
const mongoose = require('mongoose');
const SeatInventory = require('./backend/models/flight/seatInventory.model');

async function checkSeats() {
    try {
        await mongoose.connect('mongodb://busbooking:busbook123@ac-mcxd6ul-shard-00-00.z2fsqnu.mongodb.net:27017,ac-mcxd6ul-shard-00-01.z2fsqnu.mongodb.net:27017,ac-mcxd6ul-shard-00-02.z2fsqnu.mongodb.net:27017/busbooking?ssl=true&replicaSet=atlas-3412qv-shard-0&authSource=admin&retryWrites=true&w=majority'); 
        const count = await SeatInventory.countDocuments();
        console.log("Total seats in DB:", count);
        
        const sample = await SeatInventory.findOne();
        console.log("Sample seat:", sample);
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSeats();
