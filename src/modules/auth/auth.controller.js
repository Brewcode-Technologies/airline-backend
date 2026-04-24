const authService = require('./auth.service');
const { success } = require('../../utils/response');

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

module.exports = { register, login, me, logout };
