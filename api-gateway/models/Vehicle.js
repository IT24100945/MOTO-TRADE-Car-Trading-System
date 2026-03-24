const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
    title: { type: String, required: true, maxlength: 255 },
    brand: { type: String, required: true, maxlength: 100 },
    model: { type: String, required: true, maxlength: 100 },
    year: { type: Number, required: true },
    price: { type: Number, required: true },
    mileage: { type: Number, required: true },
    fuelType: { type: String, required: true, maxlength: 50 },
    transmission: { type: String, required: true, maxlength: 50 },
    condition: { type: String, required: true, maxlength: 50 },
    district: { type: String, required: true, maxlength: 100 },
    city: { type: String, required: true, maxlength: 100 },
    description: { type: String, required: false },
    availabilityStatus: { type: String, default: 'Available', maxlength: 20 },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    videoUrl: { type: String, required: false, maxlength: 255 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

VehicleSchema.virtual('VehicleImages', {
    ref: 'VehicleImage',
    localField: '_id',
    foreignField: 'vehicleId'
});

VehicleSchema.set('toJSON', { virtuals: true });
VehicleSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Vehicle', VehicleSchema);
