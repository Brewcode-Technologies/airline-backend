const router = require('express').Router();
const { getProof, submitProof } = require('./proof.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const upload = require('../../config/upload');

router.use(authMiddleware);
router.get('/:orderId', getProof);
router.post('/', upload.single('photo'), submitProof);

module.exports = router;
