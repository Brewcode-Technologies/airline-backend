const trackingService = require('./tracking.service');
const { success } = require('../../utils/response');

const getTracking = async (req, res, next) => { try { success(res, await trackingService.getByOrder(req.params.orderId)); } catch (e) { next(e); } };
const addLocation = async (req, res, next) => { try { res.status(201).json({ success: true, data: await trackingService.addLocation(req.body) }); } catch (e) { next(e); } };

module.exports = { getTracking, addLocation };
