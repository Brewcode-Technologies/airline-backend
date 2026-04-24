const router = require('express').Router();
const { getSKUs, getSKU, createSKU, updateSKU, deleteSKU } = require('./sku.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');

router.use(authMiddleware);
router.get('/', getSKUs);
router.get('/:id', getSKU);
router.post('/', roleMiddleware('admin'), createSKU);
router.put('/:id', roleMiddleware('admin'), updateSKU);
router.delete('/:id', roleMiddleware('admin'), deleteSKU);

module.exports = router;
