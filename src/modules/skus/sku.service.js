const SKU = require('../../models/SKU');

const getAll = () => SKU.find().populate('vendor', 'name');
const getById = (id) => SKU.findById(id).populate('vendor', 'name');
const create = async (data) => {
  const existing = await SKU.findOne({ code: data.code });
  if (existing) throw Object.assign(new Error(`SKU code '${data.code}' already exists`), { statusCode: 409 });
  return SKU.create(data);
};
const update = (id, data) => SKU.findByIdAndUpdate(id, data, { new: true });
const remove = (id) => SKU.findByIdAndDelete(id);

module.exports = { getAll, getById, create, update, remove };
