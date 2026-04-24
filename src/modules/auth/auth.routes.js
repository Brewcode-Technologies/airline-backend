const router = require('express').Router();
const { register, login, me, logout } = require('./auth.controller');
const authMiddleware = require('../../middleware/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, me);

module.exports = router;
