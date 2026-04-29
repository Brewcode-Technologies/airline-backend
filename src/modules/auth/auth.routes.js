const router = require('express').Router();
const { register, login, me, updateMe, logout, googleCallback } = require('./auth.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const passport = require('../../config/passport');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, me);
router.put('/me', authMiddleware, updateMe);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/admin-login?error=google_failed` }),
  googleCallback
);

module.exports = router;
