const router = require('express').Router();
const { getProof, submitProof } = require('./proof.controller');
const authMiddleware = require('../../middleware/auth.middleware');

router.use(authMiddleware);
router.get('/:orderId', getProof);
router.post('/', submitProof);

module.exports = router;
