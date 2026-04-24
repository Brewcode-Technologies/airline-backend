const analyticsService = require('./analytics.service');
const { success } = require('../../utils/response');

const getSummary = async (req, res, next) => { try { success(res, await analyticsService.getSummary()); } catch (e) { next(e); } };
const getOrdersByStatus = async (req, res, next) => { try { success(res, await analyticsService.getOrdersByStatus()); } catch (e) { next(e); } };
const getOrdersAnalytics = async (req, res, next) => { try { success(res, await analyticsService.getOrdersAnalytics()); } catch (e) { next(e); } };
const getSlaAnalytics = async (req, res, next) => { try { success(res, await analyticsService.getSlaAnalytics()); } catch (e) { next(e); } };

module.exports = { getSummary, getOrdersByStatus, getOrdersAnalytics, getSlaAnalytics };
