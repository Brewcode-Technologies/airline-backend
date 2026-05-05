const router = require('express').Router();
const { getSKUs, getSKU, createSKU, updateSKU, deleteSKU, getApprovedSKUs, uploadSKUImage } = require('./sku.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');
const upload = require('../../config/upload');

router.use(authMiddleware);
router.get('/approved', roleMiddleware('airline'), getApprovedSKUs);
router.get('/', getSKUs);
router.get('/:id', getSKU);
router.post('/', roleMiddleware('admin', 'vendor'), createSKU);
router.put('/:id', roleMiddleware('admin', 'vendor'), updateSKU);
router.post('/:id/image', roleMiddleware('admin', 'vendor'), upload.single('image'), uploadSKUImage);
router.delete('/:id', roleMiddleware('admin', 'vendor'), deleteSKU);

module.exports = router;
