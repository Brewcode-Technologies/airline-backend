const User = require('../../models/User');
const { hashPassword, comparePassword } = require('../../utils/hash');
const { signToken } = require('../../utils/jwt');

const register = async ({ name, email, password, role }) => {
  if (!name) throw Object.assign(new Error('Name is required'), { statusCode: 400 });
  if (!email) throw Object.assign(new Error('Email is required'), { statusCode: 400 });
  if (!password) throw Object.assign(new Error('Password is required'), { statusCode: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw Object.assign(new Error('Invalid email format'), { statusCode: 400 });
  if (password.length < 6) throw Object.assign(new Error('Password must be at least 6 characters'), { statusCode: 400 });
  const validRoles = ['admin', 'airline', 'driver'];
  if (role && !validRoles.includes(role)) throw Object.assign(new Error('Invalid role'), { statusCode: 400 });
  const existing = await User.findOne({ email });
  if (existing) throw Object.assign(new Error('Email already in use'), { statusCode: 409 });
  const hashed = await hashPassword(password);
  const user = await User.create({ name, email, password: hashed, role });
  const token = signToken({ id: user._id, role: user.role });
  return { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user || !(await comparePassword(password, user.password)))
    throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
  const token = signToken({ id: user._id, role: user.role });
  return { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } };
};

const me = async (userId) => User.findById(userId).select('-password');

module.exports = { register, login, me };
