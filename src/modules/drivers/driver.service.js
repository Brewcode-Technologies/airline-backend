const Driver = require('../../models/Driver');
const User = require('../../models/User');

const getAll = () => Driver.find().populate('user', 'name email _id');
const getById = (id) => Driver.findById(id).populate('user', 'name email _id');
const create = (data) => Driver.create(data);
const update = async (id, data) => {
  const driver = await Driver.findByIdAndUpdate(id, data, { new: true });
  if (!driver) { const err = new Error('Driver not found'); err.statusCode = 404; throw err; }
  return driver;
};
const remove = async (id) => {
  const driver = await Driver.findById(id);
  if (driver?.user) await User.findByIdAndDelete(driver.user);
  return Driver.findByIdAndDelete(id);
};

module.exports = { getAll, getById, create, update, remove };
