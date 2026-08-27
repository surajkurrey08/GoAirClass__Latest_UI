const mongoose = require('mongoose');

require('./env');

const connectDatabase = () => {
    return mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 60000,
        connectTimeoutMS: 60000
    });
};

module.exports = connectDatabase;
