const skuService = require('./sku.service');
const { success } = require('../../utils/response');

const getSKUs = async (req, res, next) => { try { success(res, await skuService.getAll()); } catch (e) { next(e); } };
const getSKU = async (req, res, next) => { try { success(res, await skuService.getById(req.params.id)); } catch (e) { next(e); } };
const createSKU = async (req, res, next) => { try { res.status(201).json({ success: true, data: await skuService.create(req.body) }); } catch (e) { next(e); } };
const updateSKU = async (req, res, next) => { try { success(res, await skuService.update(req.params.id, req.body)); } catch (e) { next(e); } };
const deleteSKU = async (req, res, next) => { try { success(res, await skuService.remove(req.params.id)); } catch (e) { next(e); } };

module.exports = { getSKUs, getSKU, createSKU, updateSKU, deleteSKU };
