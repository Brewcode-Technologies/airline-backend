const Category = require('../../models/Category');
const User = require('../../models/User');
const { success } = require('../../utils/response');

const getCategories = async (req, res, next) => {
  try {
    success(res, await Category.find().populate('vendor', 'name'));
  } catch (e) { next(e); }
};

const getCategoriesByVendor = async (req, res, next) => {
  try {
    success(res, await Category.find({ vendor: req.params.vendorId }));
  } catch (e) { next(e); }
};

const createCategory = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const vendorId = user.role === 'admin' ? req.body.vendor : user.vendor;
    if (!vendorId) return res.status(400).json({ success: false, message: 'No vendor linked' });
    const cat = await Category.create({ ...req.body, vendor: vendorId });
    res.status(201).json({ success: true, data: cat });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ success: false, message: 'Category already exists for this vendor' });
    next(e);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
    success(res, cat);
  } catch (e) { next(e); }
};

const deleteCategory = async (req, res, next) => {
  try {
    const cat = await Category.findByIdAndDelete(req.params.id);
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
    success(res, cat);
  } catch (e) { next(e); }
};

module.exports = { getCategories, getCategoriesByVendor, createCategory, updateCategory, deleteCategory };
