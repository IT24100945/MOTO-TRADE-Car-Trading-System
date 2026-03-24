const { Vehicle, VehicleImage } = require('../models');
const { getIo } = require('../socket');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

exports.getVehicles = async (req, res) => {
    try {
        const microserviceUrl = process.env.MICROSERVICE_URL || 'http://localhost:8080';
        try {
            const resp = await axios.get(`${microserviceUrl}/api/v1/vehicles/filter`, { params: req.query });
            return res.status(200).json({ success: true, count: resp.data.data.length, data: resp.data.data });
        } catch (err) {
            console.log('Microservice unreachable, falling back to local query');
            let { brand, model, yearMin, yearMax, minPrice, maxPrice, fuelType, transmission, district, availabilityStatus, sort } = req.query;

            let where = {};

            if (brand) where.brand = { $regex: new RegExp(brand, 'i') };
            if (model) where.model = { $regex: new RegExp(model, 'i') };
            if (fuelType) where.fuelType = fuelType;
            if (transmission) where.transmission = transmission;
            if (district) where.district = district;
            if (availabilityStatus) where.availabilityStatus = availabilityStatus;

            if (yearMin || yearMax) {
                where.year = {};
                if (yearMin) where.year.$gte = Number(yearMin);
                if (yearMax) where.year.$lte = Number(yearMax);
            }

            if (minPrice || maxPrice) {
                where.price = {};
                if (minPrice) where.price.$gte = Number(minPrice);
                if (maxPrice) where.price.$lte = Number(maxPrice);
            }

            let order = { createdAt: -1 };
            if (sort === 'priceAsc') order = { price: 1 };
            if (sort === 'priceDesc') order = { price: -1 };
            if (sort === 'newest') order = { year: -1 };
            if (sort === 'oldest') order = { year: 1 };
            if (sort === 'mileageAsc') order = { mileage: 1 };

            const vehicles = await Vehicle.find(where)
                .sort(order)
                .populate('VehicleImages');

            res.status(200).json({ success: true, count: vehicles.length, data: vehicles });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id)
            .populate('VehicleImages');

        if (!vehicle) {
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        }

        res.status(200).json({ success: true, data: vehicle });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createVehicle = async (req, res) => {
    try {
        req.body.sellerId = req.user.id;

        if (req.files && req.files.video && req.files.video.length > 0) {
            req.body.videoUrl = `/uploads/vehicles/${req.files.video[0].filename}`;
        }

        const vehicle = await Vehicle.create(req.body);

        if (req.files && req.files.images && req.files.images.length > 0) {
            const imagePromises = req.files.images.map(file => {
                return VehicleImage.create({
                    vehicleId: vehicle._id,
                    imageUrl: `/uploads/vehicles/${file.filename}`
                });
            });
            await Promise.all(imagePromises);
        }

        const createdVehicle = await Vehicle.findById(vehicle._id).populate('VehicleImages');

        try {
            getIo().emit('new_vehicle', createdVehicle);
        } catch (e) { }

        res.status(201).json({ success: true, data: createdVehicle });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateVehicle = async (req, res) => {
    try {
        let vehicle = await Vehicle.findById(req.params.id);

        if (!vehicle) {
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        }

        if (vehicle.sellerId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this vehicle' });
        }

        if (req.files && req.files.video && req.files.video.length > 0) {
            if (vehicle.videoUrl && vehicle.videoUrl.startsWith('/uploads/vehicles/')) {
                const oldVidPath = path.join(__dirname, '..', vehicle.videoUrl);
                if (fs.existsSync(oldVidPath)) fs.unlinkSync(oldVidPath);
            }
            req.body.videoUrl = `/uploads/vehicles/${req.files.video[0].filename}`;
        }

        vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

        if (req.body.imagesToDelete) {
            let idsToDelete = [];
            try {
                idsToDelete = JSON.parse(req.body.imagesToDelete);
            } catch (e) {
                if (typeof req.body.imagesToDelete === 'string') {
                    idsToDelete = req.body.imagesToDelete.split(',');
                }
            }
            const oldImages = await VehicleImage.find({
                vehicleId: vehicle._id,
                _id: { $in: idsToDelete }
            });
            for (const img of oldImages) {
                const imgPath = path.join(__dirname, '..', img.imageUrl);
                if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
            }
            await VehicleImage.deleteMany({ _id: { $in: idsToDelete } });
        }

        if (req.files && req.files.images && req.files.images.length > 0) {
            const imagePromises = req.files.images.map(file => {
                return VehicleImage.create({
                    vehicleId: vehicle._id,
                    imageUrl: `/uploads/vehicles/${file.filename}`
                });
            });
            await Promise.all(imagePromises);
        }

        const updatedVehicle = await Vehicle.findById(vehicle._id).populate('VehicleImages');

        try {
            getIo().emit('update_vehicle', updatedVehicle);
        } catch (e) { }

        res.status(200).json({ success: true, data: updatedVehicle });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);

        if (!vehicle) {
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        }

        if (vehicle.sellerId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this vehicle' });
        }

        const images = await VehicleImage.find({ vehicleId: vehicle._id });
        images.forEach(img => {
            const imgPath = path.join(__dirname, '..', img.imageUrl);
            if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        });
        await VehicleImage.deleteMany({ vehicleId: vehicle._id });

        if (vehicle.videoUrl && vehicle.videoUrl.startsWith('/uploads/vehicles/')) {
            const vidPath = path.join(__dirname, '..', vehicle.videoUrl);
            if (fs.existsSync(vidPath)) fs.unlinkSync(vidPath);
        }

        await Vehicle.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.markAsSold = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);

        if (!vehicle) {
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        }

        if (vehicle.sellerId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this vehicle' });
        }

        vehicle.availabilityStatus = 'Sold';
        await vehicle.save();

        try {
            getIo().emit('vehicle_sold', { id: vehicle._id, status: 'Sold' });
        } catch (e) { }

        res.status(200).json({ success: true, data: vehicle });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getSellerDashboardData = async (req, res) => {
    try {
        const sellerId = req.user.id;

        const totalListings = await Vehicle.countDocuments({ sellerId });
        const availableVehicles = await Vehicle.countDocuments({ sellerId, availabilityStatus: 'Available' });
        const soldVehicles = await Vehicle.countDocuments({ sellerId, availabilityStatus: 'Sold' });

        const recentListings = await Vehicle.find({ sellerId })
            .sort({ _id: -1 })
            .limit(5)
            .populate('VehicleImages');

        res.status(200).json({
            success: true,
            data: {
                totalListings,
                availableVehicles,
                soldVehicles,
                recentListings
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.searchSuggestions = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.status(200).json({ success: true, data: [] });

        const microserviceUrl = process.env.MICROSERVICE_URL || 'http://localhost:8080';
        try {
            const resp = await axios.get(`${microserviceUrl}/api/v1/vehicles/suggestions`, { params: { query } });
            return res.status(200).json({ success: true, data: resp.data.data });
        } catch (err) {
            console.log('Microservice unreachable for suggestions, falling back');
            const suggestions = await Vehicle.find({
                $or: [
                    { brand: { $regex: new RegExp(query, 'i') } },
                    { model: { $regex: new RegExp(query, 'i') } },
                    { city: { $regex: new RegExp(query, 'i') } }
                ]
            })
                .limit(5)
                .select('_id brand model year city');

            const formattedSuggestions = suggestions.map(s => ({
                id: s._id,
                brand: s.brand,
                model: s.model,
                year: s.year,
                city: s.city
            }));

            res.status(200).json({ success: true, data: formattedSuggestions });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getSellerVehicles = async (req, res) => {
    try {
        const sellerId = req.params.sellerId;

        if (sellerId !== req.user.id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to view other sellers vehicles' });
        }

        const vehicles = await Vehicle.find({ sellerId })
            .sort({ _id: -1 })
            .populate('VehicleImages');

        res.status(200).json({ success: true, count: vehicles.length, data: vehicles });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
