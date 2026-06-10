const mongoose = require('mongoose');
const VideoContent = require('../models/VideoContent');
require('dotenv').config();

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        const contents = await VideoContent.find();
        console.log('Count:', contents.length);
        console.log('Video Contents:', JSON.stringify(contents, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
