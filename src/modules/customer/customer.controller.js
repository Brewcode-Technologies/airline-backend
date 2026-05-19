const SKU = require('../../models/SKU');
const Service = require('../../models/Service');
const Cart = require('../../models/Cart');
const Order = require('../../models/Order');
const Feedback = require('../../models/Feedback');
const Location = require('../../models/Location');
const User = require('../../models/User');
const { success, error } = require('../../utils/response');

// ─── Catalog (Public) ────────────────────────────────────────────────────────

const getCatalog = async (req, res, next) => {
  try {
    const { category, search, sort } = req.query;
    const filter = { isActive: true };
    if (category && category !== 'All') filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };

    let query = SKU.find(filter).populate('vendor', 'name');
    if (sort === 'price_asc') query = query.sort({ price: 1 });
    else if (sort === 'price_desc') query = query.sort({ price: -1 });
    else if (sort === 'name') query = query.sort({ name: 1 });
    else if (sort === 'rating') query = query.sort({ rating: -1 });
    else query = query.sort({ createdAt: -1 });

    const skus = await query;
    success(res, skus);
  } catch (e) { next(e); }
};

const getCatalogItem = async (req, res, next) => {
  try {
    const sku = await SKU.findById(req.params.id).populate('vendor', 'name');
    if (!sku) return error(res, 'Item not found', 404);
    success(res, sku);
  } catch (e) { next(e); }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await SKU.distinct('category', { isActive: true });
    success(res, categories);
  } catch (e) { next(e); }
};

// ─── Services (Public) ───────────────────────────────────────────────────────

const getServices = async (req, res, next) => {
  try {
    const { category, search, sort } = req.query;
    const filter = { isActive: true };
    if (category && category !== 'All') filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };

    let query = Service.find(filter);
    if (sort === 'price_asc') query = query.sort({ price: 1 });
    else if (sort === 'price_desc') query = query.sort({ price: -1 });
    else if (sort === 'name') query = query.sort({ name: 1 });
    else if (sort === 'rating') query = query.sort({ rating: -1 });
    else query = query.sort({ createdAt: -1 });

    const services = await query;
    success(res, services);
  } catch (e) { next(e); }
};

const getServiceItem = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return error(res, 'Service not found', 404);
    success(res, service);
  } catch (e) { next(e); }
};

const getServiceCategories = async (req, res, next) => {
  try {
    const categories = await Service.distinct('category', { isActive: true });
    success(res, categories);
  } catch (e) { next(e); }
};

// ─── Cart ────────────────────────────────────────────────────────────────────

const calcTotal = (cart) => {
  const itemsTotal = (cart.items || []).reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const servicesTotal = (cart.services || []).reduce((sum, s) => sum + (s.price * s.quantity), 0);
  return itemsTotal + servicesTotal;
};

const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ customer: req.user.id }).populate('items.sku').populate('services.service');
    if (!cart) cart = { items: [], services: [], totalAmount: 0 };
    success(res, cart);
  } catch (e) { next(e); }
};

const addToCart = async (req, res, next) => {
  try {
    const { skuId, quantity } = req.body;
    if (!skuId || !quantity) return error(res, 'skuId and quantity are required', 400);

    const sku = await SKU.findById(skuId);
    if (!sku) return error(res, 'SKU not found', 404);

    let cart = await Cart.findOne({ customer: req.user.id });
    if (!cart) cart = new Cart({ customer: req.user.id, items: [], services: [], totalAmount: 0 });

    const existingIdx = cart.items.findIndex(i => i.sku.toString() === skuId);
    if (existingIdx >= 0) {
      cart.items[existingIdx].quantity += quantity;
      cart.items[existingIdx].price = sku.price;
    } else {
      cart.items.push({ sku: skuId, quantity, price: sku.price });
    }

    cart.totalAmount = calcTotal(cart);
    await cart.save();
    await cart.populate('items.sku');
    await cart.populate('services.service');
    success(res, cart);
  } catch (e) { next(e); }
};

const addServiceToCart = async (req, res, next) => {
  try {
    const { serviceId, quantity } = req.body;
    if (!serviceId) return error(res, 'serviceId is required', 400);
    const qty = quantity || 1;

    const service = await Service.findById(serviceId);
    if (!service) return error(res, 'Service not found', 404);

    let cart = await Cart.findOne({ customer: req.user.id });
    if (!cart) cart = new Cart({ customer: req.user.id, items: [], services: [], totalAmount: 0 });

    const existingIdx = cart.services.findIndex(s => s.service.toString() === serviceId);
    if (existingIdx >= 0) {
      cart.services[existingIdx].quantity += qty;
      cart.services[existingIdx].price = service.price;
    } else {
      cart.services.push({ service: serviceId, quantity: qty, price: service.price });
    }

    cart.totalAmount = calcTotal(cart);
    await cart.save();
    await cart.populate('items.sku');
    await cart.populate('services.service');
    success(res, cart);
  } catch (e) { next(e); }
};

const updateCartItem = async (req, res, next) => {
  try {
    const { skuId, quantity } = req.body;
    if (!skuId || quantity === undefined) return error(res, 'skuId and quantity are required', 400);

    const cart = await Cart.findOne({ customer: req.user.id });
    if (!cart) return error(res, 'Cart not found', 404);

    const idx = cart.items.findIndex(i => i.sku.toString() === skuId);
    if (idx < 0) return error(res, 'Item not in cart', 404);

    if (quantity <= 0) {
      cart.items.splice(idx, 1);
    } else {
      cart.items[idx].quantity = quantity;
    }

    cart.totalAmount = calcTotal(cart);
    await cart.save();
    await cart.populate('items.sku');
    await cart.populate('services.service');
    success(res, cart);
  } catch (e) { next(e); }
};

const updateCartService = async (req, res, next) => {
  try {
    const { serviceId, quantity } = req.body;
    if (!serviceId || quantity === undefined) return error(res, 'serviceId and quantity are required', 400);

    const cart = await Cart.findOne({ customer: req.user.id });
    if (!cart) return error(res, 'Cart not found', 404);

    const idx = cart.services.findIndex(s => s.service.toString() === serviceId);
    if (idx < 0) return error(res, 'Service not in cart', 404);

    if (quantity <= 0) {
      cart.services.splice(idx, 1);
    } else {
      cart.services[idx].quantity = quantity;
    }

    cart.totalAmount = calcTotal(cart);
    await cart.save();
    await cart.populate('items.sku');
    await cart.populate('services.service');
    success(res, cart);
  } catch (e) { next(e); }
};

const removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ customer: req.user.id });
    if (!cart) return error(res, 'Cart not found', 404);

    cart.items = cart.items.filter(i => i.sku.toString() !== req.params.skuId);
    cart.totalAmount = calcTotal(cart);
    await cart.save();
    await cart.populate('items.sku');
    await cart.populate('services.service');
    success(res, cart);
  } catch (e) { next(e); }
};

const removeServiceFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ customer: req.user.id });
    if (!cart) return error(res, 'Cart not found', 404);

    cart.services = cart.services.filter(s => s.service.toString() !== req.params.serviceId);
    cart.totalAmount = calcTotal(cart);
    await cart.save();
    await cart.populate('items.sku');
    await cart.populate('services.service');
    success(res, cart);
  } catch (e) { next(e); }
};

const clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndDelete({ customer: req.user.id });
    success(res, { items: [], services: [], totalAmount: 0 });
  } catch (e) { next(e); }
};

// ─── Orders ──────────────────────────────────────────────────────────────────

const placeOrder = async (req, res, next) => {
  try {
    const { deliveryLocation, deliveryInstructions, customerPhone } = req.body;
    if (!deliveryLocation) return error(res, 'deliveryLocation is required', 400);

    const cart = await Cart.findOne({ customer: req.user.id }).populate('items.sku').populate('services.service');
    if (!cart || (cart.items.length === 0 && cart.services.length === 0)) return error(res, 'Cart is empty', 400);

    const user = await User.findById(req.user.id);
    const orderNumber = `CUST-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const order = await Order.create({
      orderNumber,
      items: cart.items.map(i => ({ sku: i.sku._id, quantity: i.quantity })),
      services: cart.services.map(s => ({ service: s.service._id, quantity: s.quantity })),
      status: 'pending',
      createdBy: req.user.id,
      orderType: 'customer',
      customerName: user.name,
      customerPhone: customerPhone || user.phone || '',
      deliveryLocation,
      deliveryInstructions: deliveryInstructions || '',
      slaDeadline: new Date(Date.now() + 22 * 60 * 1000),
      deliveryOtp: String(Math.floor(1000 + Math.random() * 9000)),
    });

    // Clear cart after order
    await Cart.findOneAndDelete({ customer: req.user.id });

    res.status(201).json({ success: true, data: order });
  } catch (e) { next(e); }
};

const getOrders = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { createdBy: req.user.id, orderType: 'customer' };
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate('items.sku')
      .populate('services.service')
      .sort({ createdAt: -1 });
    success(res, orders);
  } catch (e) { next(e); }
};

const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, createdBy: req.user.id })
      .populate('items.sku')
      .populate('services.service')
      .populate({ path: 'driver', populate: { path: 'user', select: 'name phone' } });
    if (!order) return error(res, 'Order not found', 404);
    success(res, order);
  } catch (e) { next(e); }
};

const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!order) return error(res, 'Order not found', 404);
    if (order.status !== 'pending') return error(res, 'Only pending orders can be cancelled', 400);

    order.status = 'cancelled';
    await order.save();
    success(res, order);
  } catch (e) { next(e); }
};

const reorder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, createdBy: req.user.id }).populate('items.sku').populate('services.service');
    if (!order) return error(res, 'Order not found', 404);

    let cart = await Cart.findOne({ customer: req.user.id });
    if (!cart) cart = new Cart({ customer: req.user.id, items: [], services: [], totalAmount: 0 });

    for (const item of order.items) {
      const sku = item.sku;
      if (!sku) continue;
      const existingIdx = cart.items.findIndex(i => i.sku.toString() === sku._id.toString());
      if (existingIdx >= 0) {
        cart.items[existingIdx].quantity += item.quantity;
        cart.items[existingIdx].price = sku.price;
      } else {
        cart.items.push({ sku: sku._id, quantity: item.quantity, price: sku.price });
      }
    }

    for (const svc of (order.services || [])) {
      const service = svc.service;
      if (!service) continue;
      const existingIdx = cart.services.findIndex(s => s.service.toString() === service._id.toString());
      if (existingIdx >= 0) {
        cart.services[existingIdx].quantity += svc.quantity;
        cart.services[existingIdx].price = service.price;
      } else {
        cart.services.push({ service: service._id, quantity: svc.quantity, price: service.price });
      }
    }

    cart.totalAmount = calcTotal(cart);
    await cart.save();
    await cart.populate('items.sku');
    await cart.populate('services.service');
    success(res, cart);
  } catch (e) { next(e); }
};

// ─── Tracking ────────────────────────────────────────────────────────────────

const getTracking = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!order) return error(res, 'Order not found', 404);

    const locations = await Location.find({ order: req.params.id }).sort({ recordedAt: 1 });
    success(res, { order, locations });
  } catch (e) { next(e); }
};

// ─── Feedback ────────────────────────────────────────────────────────────────

const submitFeedback = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) return error(res, 'Rating must be between 1 and 5', 400);

    const order = await Order.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!order) return error(res, 'Order not found', 404);
    if (order.status !== 'delivered') return error(res, 'Can only rate delivered orders', 400);

    const existing = await Feedback.findOne({ order: req.params.id, customer: req.user.id });
    if (existing) return error(res, 'Feedback already submitted', 409);

    const feedback = await Feedback.create({
      order: req.params.id,
      customer: req.user.id,
      rating,
      comment: comment || '',
    });

    res.status(201).json({ success: true, data: feedback });
  } catch (e) { next(e); }
};

const getFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findOne({ order: req.params.id, customer: req.user.id });
    success(res, feedback);
  } catch (e) { next(e); }
};

// ─── Profile ─────────────────────────────────────────────────────────────────

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    success(res, user);
  } catch (e) { next(e); }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, gate, seatNumber, airport } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (gate !== undefined) updates.gate = gate;
    if (seatNumber !== undefined) updates.seatNumber = seatNumber;
    if (airport !== undefined) updates.airport = airport;

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
    success(res, user);
  } catch (e) { next(e); }
};

module.exports = {
  getCatalog, getCatalogItem, getCategories,
  getServices, getServiceItem, getServiceCategories,
  getCart, addToCart, addServiceToCart, updateCartItem, updateCartService, removeFromCart, removeServiceFromCart, clearCart,
  placeOrder, getOrders, getOrder, cancelOrder, reorder,
  getTracking,
  submitFeedback, getFeedback,
  getProfile, updateProfile,
};
