const { verifyToken } = require('../utils/jwt');

const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try { req.user = verifyToken(token); } catch {}
  }
  next();
};

module.exports = optionalAuth;
