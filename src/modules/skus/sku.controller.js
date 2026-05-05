const skuService = require('./sku.service');
const SKU = require('../../models/SKU');
const { success } = require('../../utils/response');

const getSKUs         = async (req, res, next) => {
  try {
    const { vendorId } = req.query;
    if (vendorId) {
      const skus = await SKU.find({ vendor: vendorId }).populate('vendor', 'name').populate('approvedAirlines', 'name email');
      return success(res, skus);
    }
    success(res, await skuService.getAll());
  } catch (e) { next(e); }
};
const getSKU          = async (req, res, next) => { try { success(res, await skuService.getById(req.params.id)); } catch (e) { next(e); } };
const createSKU       = async (req, res, next) => { try { res.status(201).json({ success: true, data: await skuService.create(req.body) }); } catch (e) { next(e); } };
const updateSKU       = async (req, res, next) => { try { success(res, await skuService.update(req.params.id, req.body)); } catch (e) { next(e); } };
const deleteSKU       = async (req, res, next) => { try { success(res, await skuService.remove(req.params.id)); } catch (e) { next(e); } };
const getApprovedSKUs = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    success(res, await skuService.getApproved(userId));
  } catch (e) { next(e); }
};
const uploadSKUImage  = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image uploaded' });
    const imageUrl = `/uploads/${req.file.filename}`;
    const sku = await skuService.update(req.params.id, { image: imageUrl });
    success(res, sku);
  } catch (e) { next(e); }
};

module.exports = { getSKUs, getSKU, createSKU, updateSKU, deleteSKU, getApprovedSKUs, uploadSKUImage };
