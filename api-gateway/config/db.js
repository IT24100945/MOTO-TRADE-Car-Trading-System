const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        const uri = `mongodb://${process.env.DB_SERVER || 'localhost'}:27017/${process.env.DB_NAME}`;
        await mongoose.connect(uri);
        console.log('MongoDB Database connected...');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

module.exports = { connectDB };
