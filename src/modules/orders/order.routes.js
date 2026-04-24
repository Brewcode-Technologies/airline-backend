const router = require('express').Router();
const { getOrders, getOrder, createOrder, updateOrder, deleteOrder, assignDriver, updateStatus, setPicked, setEnroute, setDelivered } = require('./order.controller');
const { getProof, submitProof } = require('../proof/proof.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');

router.use(authMiddleware);
router.get('/', getOrders);
router.post('/', roleMiddleware('admin', 'airline'), createOrder);
router.get('/:id', getOrder);
router.put('/:id', roleMiddleware('admin', 'airline'), updateOrder);
router.delete('/:id', roleMiddleware('admin'), deleteOrder);
router.post('/:id/assign-driver', roleMiddleware('admin'), assignDriver);
router.put('/:id/status', roleMiddleware('admin', 'airline'), updateStatus);
router.put('/:id/picked', roleMiddleware('admin', 'airline', 'driver'), setPicked);
router.put('/:id/enroute', roleMiddleware('admin', 'airline', 'driver'), setEnroute);
router.put('/:id/delivered', roleMiddleware('admin', 'airline', 'driver'), setDelivered);
router.post('/:id/proof', submitProof);
router.get('/:id/proof', getProof);

module.exports = router;
