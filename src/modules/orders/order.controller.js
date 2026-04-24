const orderService = require('./order.service');
const { success } = require('../../utils/response');

const getOrders = async (req, res, next) => { try { success(res, await orderService.getAll()); } catch (e) { next(e); } };
const getOrder = async (req, res, next) => { try { success(res, await orderService.getById(req.params.id)); } catch (e) { next(e); } };
const createOrder = async (req, res, next) => { try { res.status(201).json({ success: true, data: await orderService.create(req.body) }); } catch (e) { next(e); } };
const updateOrder = async (req, res, next) => { try { success(res, await orderService.update(req.params.id, req.body)); } catch (e) { next(e); } };
const deleteOrder = async (req, res, next) => { try { success(res, await orderService.remove(req.params.id)); } catch (e) { next(e); } };
const assignDriver = async (req, res, next) => { try { success(res, await orderService.assignDriver(req.params.id, req.body.driverId)); } catch (e) { next(e); } };
const updateStatus = async (req, res, next) => { try { success(res, await orderService.updateStatus(req.params.id, req.body.status)); } catch (e) { next(e); } };
const setPicked = async (req, res, next) => { try { success(res, await orderService.updateStatus(req.params.id, 'picked')); } catch (e) { next(e); } };
const setEnroute = async (req, res, next) => { try { success(res, await orderService.updateStatus(req.params.id, 'enroute')); } catch (e) { next(e); } };
const setDelivered = async (req, res, next) => { try { success(res, await orderService.updateStatus(req.params.id, 'delivered')); } catch (e) { next(e); } };

module.exports = { getOrders, getOrder, createOrder, updateOrder, deleteOrder, assignDriver, updateStatus, setPicked, setEnroute, setDelivered };
