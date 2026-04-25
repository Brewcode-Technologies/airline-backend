const authService = require('./auth.service');
const { success } = require('../../utils/response');
const { signToken } = require('../../utils/jwt');

const register = async (req, res, next) => {
  try { res.status(201).json({ success: true, data: await authService.register(req.body) }); }
  catch (e) { next(e); }
};

const login = async (req, res, next) => {
  try { success(res, await authService.login(req.body)); }
  catch (e) { next(e); }
};

const me = async (req, res, next) => {
  try { success(res, await authService.me(req.user.id)); }
  catch (e) { next(e); }
};

const logout = (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

const googleCallback = (req, res) => {
  const user = req.user;
  const token = signToken({ id: user._id, role: user.role });
  const params = new URLSearchParams({
    token,
    id:   user._id.toString(),
    name: user.name,
    role: user.role,
    email: user.email,
  });
  res.redirect(`${process.env.FRONTEND_URL}/auth/callback?${params}`);
};

module.exports = { register, login, me, logout, googleCallback };
