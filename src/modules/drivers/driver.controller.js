const driverService = require('./driver.service');
const { success } = require('../../utils/response');

const getDrivers = async (req, res, next) => { try { success(res, await driverService.getAll()); } catch (e) { next(e); } };
const getDriver = async (req, res, next) => { try { success(res, await driverService.getById(req.params.id)); } catch (e) { next(e); } };
const createDriver = async (req, res, next) => { try { res.status(201).json({ success: true, data: await driverService.create(req.body) }); } catch (e) { next(e); } };
const updateDriver = async (req, res, next) => { try { success(res, await driverService.update(req.params.id, req.body)); } catch (e) { next(e); } };
const updateDriverStatus = async (req, res, next) => { try { success(res, await driverService.update(req.params.id, { isAvailable: req.body.isAvailable })); } catch (e) { next(e); } };
const deleteDriver = async (req, res, next) => { try { success(res, await driverService.remove(req.params.id)); } catch (e) { next(e); } };

module.exports = { getDrivers, getDriver, createDriver, updateDriver, updateDriverStatus, deleteDriver };
