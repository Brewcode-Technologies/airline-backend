const User = require('../../models/User');
const { hashPassword } = require('../../utils/hash');

const getAll = () => User.find().select('-password');
const getById = (id) => User.findById(id).select('-password');
const create = async ({ name, email, password, role }) => {
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
  return User.findById(user._id).select('-password');
};
const update = (id, data) => User.findByIdAndUpdate(id, data, { new: true }).select('-password');
const remove = (id) => User.findByIdAndDelete(id);

module.exports = { getAll, getById, create, update, remove };
