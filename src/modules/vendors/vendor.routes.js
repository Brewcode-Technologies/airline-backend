const router = require('express').Router();
const { getVendors, getVendor, createVendor, updateVendor, deleteVendor } = require('./vendor.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');

router.use(authMiddleware);
router.get('/', getVendors);
router.get('/:id', getVendor);
router.post('/', roleMiddleware('admin'), createVendor);
router.put('/:id', roleMiddleware('admin'), updateVendor);
router.delete('/:id', roleMiddleware('admin'), deleteVendor);

module.exports = router;
