const Order = require('../../models/Order');
const Driver = require('../../models/Driver');

const getSummary = async () => {
  const [totalOrders, delivered, drivers] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ status: 'delivered' }),
    Driver.countDocuments({ isAvailable: true }),
  ]);
  return { totalOrders, delivered, pending: totalOrders - delivered, availableDrivers: drivers };
};

const getOrdersByStatus = () => Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);

const getOrdersAnalytics = async () => {
  const [total, byStatus] = await Promise.all([
    Order.countDocuments(),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);
  return { total, byStatus };
};

const getSlaAnalytics = async () => {
  const delivered = await Order.countDocuments({ status: 'delivered' });
  const total = await Order.countDocuments();
  const slaRate = total > 0 ? ((delivered / total) * 100).toFixed(2) : 0;
  return { delivered, total, slaRate: `${slaRate}%` };
};

module.exports = { getSummary, getOrdersByStatus, getOrdersAnalytics, getSlaAnalytics };
