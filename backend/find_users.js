const mongoose = require('mongoose');
require('dotenv').config();

async function findUser() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const User = mongoose.model('User', new mongoose.Schema({ mobileNumber: String }));
        const users = await User.find().limit(5);
        console.log("Users:", JSON.stringify(users, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

findUser();
