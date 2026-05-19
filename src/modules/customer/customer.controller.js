const SKU = require('../../models/SKU');
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

// ─── Cart ────────────────────────────────────────────────────────────────────

const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ customer: req.user.id }).populate('items.sku');
    if (!cart) cart = { items: [], totalAmount: 0 };
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
    if (!cart) cart = new Cart({ customer: req.user.id, items: [], totalAmount: 0 });

    const existingIdx = cart.items.findIndex(i => i.sku.toString() === skuId);
    if (existingIdx >= 0) {
      cart.items[existingIdx].quantity += quantity;
      cart.items[existingIdx].price = sku.price;
    } else {
      cart.items.push({ sku: skuId, quantity, price: sku.price });
    }

    cart.totalAmount = cart.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    await cart.save();
    await cart.populate('items.sku');
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

    cart.totalAmount = cart.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    await cart.save();
    await cart.populate('items.sku');
    success(res, cart);
  } catch (e) { next(e); }
};

const removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ customer: req.user.id });
    if (!cart) return error(res, 'Cart not found', 404);

    cart.items = cart.items.filter(i => i.sku.toString() !== req.params.skuId);
    cart.totalAmount = cart.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    await cart.save();
    await cart.populate('items.sku');
    success(res, cart);
  } catch (e) { next(e); }
};

const clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndDelete({ customer: req.user.id });
    success(res, { items: [], totalAmount: 0 });
  } catch (e) { next(e); }
};

// ─── Orders ──────────────────────────────────────────────────────────────────

const placeOrder = async (req, res, next) => {
  try {
    const { deliveryLocation, deliveryInstructions, customerPhone } = req.body;
    if (!deliveryLocation) return error(res, 'deliveryLocation is required', 400);

    const cart = await Cart.findOne({ customer: req.user.id }).populate('items.sku');
    if (!cart || cart.items.length === 0) return error(res, 'Cart is empty', 400);

    const user = await User.findById(req.user.id);
    const orderNumber = `CUST-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const order = await Order.create({
      orderNumber,
      items: cart.items.map(i => ({ sku: i.sku._id, quantity: i.quantity })),
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
      .sort({ createdAt: -1 });
    success(res, orders);
  } catch (e) { next(e); }
};

const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, createdBy: req.user.id })
      .populate('items.sku')
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
    const order = await Order.findOne({ _id: req.params.id, createdBy: req.user.id }).populate('items.sku');
    if (!order) return error(res, 'Order not found', 404);

    let cart = await Cart.findOne({ customer: req.user.id });
    if (!cart) cart = new Cart({ customer: req.user.id, items: [], totalAmount: 0 });

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

    cart.totalAmount = cart.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    await cart.save();
    await cart.populate('items.sku');
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
  getCart, addToCart, updateCartItem, removeFromCart, clearCart,
  placeOrder, getOrders, getOrder, cancelOrder, reorder,
  getTracking,
  submitFeedback, getFeedback,
  getProfile, updateProfile,
};
