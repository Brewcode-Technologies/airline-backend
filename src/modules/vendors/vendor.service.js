const Vendor = require('../../models/Vendor');

const getAll = () => Vendor.find();
const getById = (id) => Vendor.findById(id);
const create = (data) => Vendor.create(data);
const update = (id, data) => Vendor.findByIdAndUpdate(id, data, { new: true });
const remove = (id) => Vendor.findByIdAndDelete(id);

module.exports = { getAll, getById, create, update, remove };
