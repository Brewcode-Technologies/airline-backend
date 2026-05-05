const router = require('express').Router();
const controller = require('./category.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');

router.use(authMiddleware);
router.get('/', controller.getCategories);
router.get('/vendor/:vendorId', controller.getCategoriesByVendor);
router.post('/', roleMiddleware('vendor', 'admin'), controller.createCategory);
router.put('/:id', roleMiddleware('vendor', 'admin'), controller.updateCategory);
router.delete('/:id', roleMiddleware('vendor', 'admin'), controller.deleteCategory);

module.exports = router;
