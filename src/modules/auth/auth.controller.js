const authService = require('./auth.service');
const { success } = require('../../utils/response');
const { signToken } = require('../../utils/jwt');

const register = async (req, res, next) => {
  try { res.status(201).json({ success: true, data: await authService.register(req.body, req.user) }); }
  catch (e) { next(e); }
};

const login = async (req, res, next) => {
  try { success(res, await authService.login(req.body)); }
  catch (e) { next(e); }
};

const User = require('../../models/User');

const me = async (req, res, next) => {
  try { success(res, await authService.me(req.user.id)); }
  catch (e) { next(e); }
};

const updateMe = async (req, res, next) => {
  try {
    const { airport, gate, name } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { ...(name && { name }), ...(airport !== undefined && { airport }), ...(gate !== undefined && { gate }) },
      { new: true }
    ).select('-password');
    success(res, updated);
  } catch (e) { next(e); }
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

const { hashPassword, comparePassword } = require('../../utils/hash');

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const valid = await comparePassword(currentPassword, user.password);
    if (!valid) return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    user.password = await hashPassword(newPassword);
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (e) { next(e); }
};

module.exports = { register, login, me, updateMe, logout, googleCallback, changePassword };
