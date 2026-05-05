const router = require('express').Router();
const { getVendors, getVendor, createVendor, updateVendor, deleteVendor, getVendorOrders, vendorAssignDriver, getVendorProfile, updateVendorProfile } = require('./vendor.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');

router.use(authMiddleware);
router.get('/', getVendors);
router.get('/:id', getVendor);
router.post('/', roleMiddleware('admin'), createVendor);
router.put('/:id', roleMiddleware('admin', 'vendor'), updateVendor);
router.delete('/:id', roleMiddleware('admin'), deleteVendor);

// Vendor self-service routes
router.get('/me/profile', roleMiddleware('vendor'), getVendorProfile);
router.put('/me/profile', roleMiddleware('vendor'), updateVendorProfile);
router.get('/me/orders', roleMiddleware('vendor'), getVendorOrders);
router.post('/me/orders/:orderId/assign-driver', roleMiddleware('vendor'), vendorAssignDriver);

module.exports = router;
