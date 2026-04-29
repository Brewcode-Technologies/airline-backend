const router = require('express').Router();
const { getSKUs, getSKU, createSKU, updateSKU, deleteSKU, getApprovedSKUs, uploadSKUImage } = require('./sku.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');
const upload = require('../../config/upload');

router.use(authMiddleware);
router.get('/approved', roleMiddleware('airline'), getApprovedSKUs);
router.get('/', getSKUs);
router.get('/:id', getSKU);
router.post('/', roleMiddleware('admin'), createSKU);
router.put('/:id', roleMiddleware('admin'), updateSKU);
router.post('/:id/image', roleMiddleware('admin'), upload.single('image'), uploadSKUImage);
router.delete('/:id', roleMiddleware('admin'), deleteSKU);

module.exports = router;
