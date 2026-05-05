const Order = require('../../models/Order');

const getAll = () => Order.find().populate('vendor').populate({ path: 'driver', populate: { path: 'user', select: 'name email' } });
const getById = (id) => Order.findById(id).populate('vendor').populate({ path: 'driver', populate: { path: 'user', select: 'name email' } }).populate('items.sku');
const create = async (data) => {
  if (!data.orderNumber) throw Object.assign(new Error('orderNumber is required'), { statusCode: 400 });
  const existing = await Order.findOne({ orderNumber: data.orderNumber });
  if (existing) throw Object.assign(new Error(`Order number '${data.orderNumber}' already exists`), { statusCode: 409 });
  if (!data.slaDeadline) data.slaDeadline = new Date(Date.now() + 22 * 60 * 1000);
  if (!data.deliveryOtp) data.deliveryOtp = String(Math.floor(1000 + Math.random() * 9000));
  return Order.create(data);
};

const verifyOtp = async (id, otp) => {
  const order = await Order.findById(id);
  if (!order) throw Object.assign(new Error('Order not found'), { statusCode: 404 });
  if (order.deliveryOtp !== otp) throw Object.assign(new Error('Invalid OTP'), { statusCode: 400 });
  return { valid: true };
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

module.exports = { getAll, getById, create, update, remove, assignDriver, updateStatus, verifyOtp };
