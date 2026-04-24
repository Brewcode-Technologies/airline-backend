const router = require('express').Router();
const { getTracking, addLocation } = require('./tracking.controller');
const authMiddleware = require('../../middleware/auth.middleware');

router.use(authMiddleware);
router.get('/:orderId', getTracking);
router.post('/', addLocation);

module.exports = router;
