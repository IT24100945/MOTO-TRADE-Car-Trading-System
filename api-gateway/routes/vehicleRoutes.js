const express = require('express');
const router = express.Router();
const {
    getVehicles,
    getVehicle,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    markAsSold,
    getSellerDashboardData,
    searchSuggestions,
    getSellerVehicles
} = require('../controllers/vehicleController');

const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
    .get(getVehicles)
    .post(protect, authorize('Seller'), upload.fields([{ name: 'images', maxCount: 10 }, { name: 'video', maxCount: 1 }]), createVehicle);

router.get('/dashboard', protect, authorize('Seller'), getSellerDashboardData);
router.get('/suggestions', searchSuggestions);
router.get('/seller/:sellerId', protect, authorize('Seller'), getSellerVehicles);

router.route('/:id')
    .get(getVehicle)
    .put(protect, authorize('Seller'), upload.fields([{ name: 'images', maxCount: 10 }, { name: 'video', maxCount: 1 }]), updateVehicle)
    .delete(protect, authorize('Seller'), deleteVehicle);

router.patch('/:id/sold', protect, authorize('Seller'), markAsSold);

module.exports = router;
