const mongoose = require('mongoose');

const VehicleImageSchema = new mongoose.Schema({
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    imageUrl: {
        type: String,
        required: true,
        maxlength: 255
    }
}, {
    timestamps: false
});

VehicleImageSchema.set('toJSON', { virtuals: true });
VehicleImageSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('VehicleImage', VehicleImageSchema);
