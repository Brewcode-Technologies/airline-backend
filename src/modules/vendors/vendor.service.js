const Vendor = require('../../models/Vendor');
const User = require('../../models/User');

const getAll = () => Vendor.find();
const getById = (id) => Vendor.findById(id);
const create = (data) => Vendor.create(data);
const update = (id, data) => Vendor.findByIdAndUpdate(id, data, { new: true });
const remove = async (id) => {
  // Also delete the linked user account
  await User.findOneAndDelete({ vendor: id });
  return Vendor.findByIdAndDelete(id);
};

module.exports = { getAll, getById, create, update, remove };
