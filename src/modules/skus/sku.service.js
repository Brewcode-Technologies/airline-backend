const SKU = require('../../models/SKU');

const getAll = () => SKU.find().populate('vendor', 'name').populate('approvedAirlines', 'name email');
const getById = (id) => SKU.findById(id).populate('vendor', 'name');
const create = async (data) => {
  const existing = await SKU.findOne({ code: data.code });
  if (existing) throw Object.assign(new Error(`SKU code '${data.code}' already exists`), { statusCode: 409 });
  return SKU.create(data);
};
const update = (id, data) => SKU.findByIdAndUpdate(id, data, { new: true }).populate('approvedAirlines', 'name email');
const remove = (id) => SKU.findByIdAndDelete(id);

// returns SKUs approved for the given airline user ID
// fallback: if no SKUs are specifically approved for this airline, return all active SKUs
const getApproved = async (userId) => {
  const approved = await SKU.find({ isActive: true, approvedAirlines: userId }).populate('vendor', 'name');
  if (approved.length > 0) return approved;
  // fallback — return all active SKUs so airline can always see catalog
  return SKU.find({ isActive: true }).populate('vendor', 'name');
};

module.exports = { getAll, getById, create, update, remove, getApproved };
