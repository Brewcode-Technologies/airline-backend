const analyticsService = require('./analytics.service');
const { success } = require('../../utils/response');

const getSummary = async (req, res, next) => { try { success(res, await analyticsService.getSummary(req.user)); } catch (e) { next(e); } };
const getOrdersByStatus = async (req, res, next) => { try { success(res, await analyticsService.getOrdersByStatus(req.user)); } catch (e) { next(e); } };
const getOrdersAnalytics = async (req, res, next) => { try { success(res, await analyticsService.getOrdersAnalytics(req.user)); } catch (e) { next(e); } };
const getSlaAnalytics = async (req, res, next) => { try { success(res, await analyticsService.getSlaAnalytics(req.user)); } catch (e) { next(e); } };

module.exports = { getSummary, getOrdersByStatus, getOrdersAnalytics, getSlaAnalytics };
