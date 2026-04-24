const router = require('express').Router();
const { getSummary, getOrdersByStatus, getOrdersAnalytics, getSlaAnalytics } = require('./analytics.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');

router.use(authMiddleware, roleMiddleware('admin', 'airline'));
router.get('/summary', getSummary);
router.get('/orders-by-status', getOrdersByStatus);
router.get('/orders', getOrdersAnalytics);
router.get('/sla', getSlaAnalytics);

module.exports = router;
