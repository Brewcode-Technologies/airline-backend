const vendorService = require('./vendor.service');
const { success } = require('../../utils/response');

const getVendors = async (req, res, next) => { try { success(res, await vendorService.getAll()); } catch (e) { next(e); } };
const getVendor = async (req, res, next) => { try { success(res, await vendorService.getById(req.params.id)); } catch (e) { next(e); } };
const createVendor = async (req, res, next) => { try { res.status(201).json({ success: true, data: await vendorService.create(req.body) }); } catch (e) { next(e); } };
const updateVendor = async (req, res, next) => { try { success(res, await vendorService.update(req.params.id, req.body)); } catch (e) { next(e); } };
const deleteVendor = async (req, res, next) => { try { success(res, await vendorService.remove(req.params.id)); } catch (e) { next(e); } };

module.exports = { getVendors, getVendor, createVendor, updateVendor, deleteVendor };
