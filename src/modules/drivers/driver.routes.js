const router = require('express').Router();
const { getDrivers, getDriver, createDriver, updateDriver, updateDriverStatus, deleteDriver } = require('./driver.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');

router.use(authMiddleware);
router.get('/', getDrivers);
router.post('/', roleMiddleware('admin'), createDriver);
router.get('/:id', getDriver);
router.put('/:id', roleMiddleware('admin'), updateDriver);
router.put('/:id/status', updateDriverStatus);
router.delete('/:id', roleMiddleware('admin'), deleteDriver);

module.exports = router;
