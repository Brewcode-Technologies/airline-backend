const router = require('express').Router();
const { register, login, me, updateMe, logout, googleCallback, changePassword } = require('./auth.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const optionalAuth = require('../../middleware/optionalAuth.middleware');
const passport = require('../../config/passport');

router.post('/register', optionalAuth, register);
router.post('/login', login);
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, me);
router.put('/me', authMiddleware, updateMe);
router.put('/change-password', authMiddleware, changePassword);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/admin-login?error=google_failed` }),
  googleCallback
);

module.exports = router;
