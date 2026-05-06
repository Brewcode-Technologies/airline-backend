const Order = require('../../models/Order');
const Driver = require('../../models/Driver');
const mongoose = require('mongoose');

const getFilter = (user) => {
  if (user && user.role === 'airline') {
    return { createdBy: new mongoose.Types.ObjectId(user.id) };
  }
  return {};
};

const getSummary = async (user) => {
  const filter = getFilter(user);
  const [totalOrders, delivered, drivers] = await Promise.all([
    Order.countDocuments(filter),
    Order.countDocuments({ ...filter, status: 'delivered' }),
    Driver.countDocuments({ isAvailable: true }),
  ]);
  return { totalOrders, delivered, pending: totalOrders - delivered, availableDrivers: drivers };
};

const getOrdersByStatus = (user) => {
  const filter = getFilter(user);
  return Order.aggregate([{ $match: filter }, { $group: { _id: '$status', count: { $sum: 1 } } }]);
};

const getOrdersAnalytics = async (user) => {
  const filter = getFilter(user);
  const [total, byStatus] = await Promise.all([
    Order.countDocuments(filter),
    Order.aggregate([{ $match: filter }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);
  return { total, byStatus };
};

const getSlaAnalytics = async (user) => {
  const filter = getFilter(user);
  const delivered = await Order.countDocuments({ ...filter, status: 'delivered' });
  const total = await Order.countDocuments(filter);
  const slaRate = total > 0 ? ((delivered / total) * 100).toFixed(2) : 0;
  return { delivered, total, slaRate: `${slaRate}%` };
};

module.exports = { getSummary, getOrdersByStatus, getOrdersAnalytics, getSlaAnalytics };
