const Order = require('../../models/Order');

const getAll = () => Order.find().populate('vendor driver');
const getById = (id) => Order.findById(id).populate('vendor driver items.sku');
const create = async (data) => {
  if (!data.orderNumber) throw Object.assign(new Error('orderNumber is required'), { statusCode: 400 });
  const existing = await Order.findOne({ orderNumber: data.orderNumber });
  if (existing) throw Object.assign(new Error(`Order number '${data.orderNumber}' already exists`), { statusCode: 409 });
  if (!data.slaDeadline) data.slaDeadline = new Date(Date.now() + 22 * 60 * 1000);
  return Order.create(data);
};
const update = (id, data) => Order.findByIdAndUpdate(id, data, { new: true });
const remove = (id) => Order.findByIdAndDelete(id);

const assignDriver = async (id, driverId) => {
  if (!driverId) throw Object.assign(new Error('driverId is required'), { statusCode: 400 });
  const Driver = require('../drivers/driver.service');
  const [order, driver] = await Promise.all([Order.findById(id), Driver.getById(driverId)]);
  if (!order) throw Object.assign(new Error('Order not found'), { statusCode: 404 });
  if (!driver) throw Object.assign(new Error('Driver not found'), { statusCode: 404 });
  return Order.findByIdAndUpdate(id, { driver: driverId, status: 'assigned' }, { new: true }).populate('vendor driver');
};

const updateStatus = async (id, status) => {
  const valid = ['pending', 'assigned', 'in_transit', 'delivered', 'cancelled', 'picked', 'enroute'];
  if (!status) throw Object.assign(new Error('status is required'), { statusCode: 400 });
  if (!valid.includes(status)) throw Object.assign(new Error('Invalid status'), { statusCode: 400 });
  return Order.findByIdAndUpdate(id, { status }, { new: true });
};

module.exports = { getAll, getById, create, update, remove, assignDriver, updateStatus };
