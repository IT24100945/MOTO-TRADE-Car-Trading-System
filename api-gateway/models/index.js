const { connectDB } = require('../config/db');
const User = require('./User');
const Vehicle = require('./Vehicle');
const VehicleImage = require('./VehicleImage');

module.exports = {
    connectDB,
    User,
    Vehicle,
    VehicleImage
};
