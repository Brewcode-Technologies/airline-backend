const vendorService = require('./vendor.service');
const Vendor = require('../../models/Vendor');
const Order = require('../../models/Order');
const User = require('../../models/User');
const { hashPassword } = require('../../utils/hash');
const { success } = require('../../utils/response');

const getVendors  = async (req, res, next) => {
  try {
    // Sync: find all vendor-role users and ensure they have a valid linked Vendor doc
    const vendorUsers = await User.find({ role: 'vendor' });
    for (const u of vendorUsers) {
      if (u.vendor) {
        const exists = await Vendor.findById(u.vendor);
        if (exists) continue; // already linked properly
      }
      // No vendor link or vendor doc was deleted — create/link one
      const existing = await Vendor.findOne({ email: u.email });
      if (existing) {
        await User.findByIdAndUpdate(u._id, { vendor: existing._id });
      } else {
        const v = await Vendor.create({ name: u.name, email: u.email, isActive: true });
        await User.findByIdAndUpdate(u._id, { vendor: v._id });
      }
    }
    success(res, await vendorService.getAll());
  } catch (e) { next(e); }
};
const getVendor   = async (req, res, next) => { try { success(res, await vendorService.getById(req.params.id)); } catch (e) { next(e); } };

const createVendor = async (req, res, next) => {
  try {
    const { name, contact, address, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'name, email and password are required' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ success: false, message: 'Email already in use' });
    // Create vendor doc first
    const vendor = await vendorService.create({ name, contact, address, email, isActive: true });
    // Create linked user account
    const hashed = await hashPassword(password);
    await User.create({ name, email, password: hashed, role: 'vendor', vendor: vendor._id });
    res.status(201).json({ success: true, data: vendor });
  } catch (e) { next(e); }
};

const updateVendor = async (req, res, next) => { try { success(res, await vendorService.update(req.params.id, req.body)); } catch (e) { next(e); } };
const deleteVendor = async (req, res, next) => { try { success(res, await vendorService.remove(req.params.id)); } catch (e) { next(e); } };

// Vendor gets their own profile (vendor doc linked to their user)
const getVendorProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('vendor');
    if (!user?.vendor) return res.status(404).json({ success: false, message: 'No vendor linked to this account' });
    success(res, user.vendor);
  } catch (e) { next(e); }
};

// Vendor updates their own profile
const updateVendorProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user?.vendor) return res.status(404).json({ success: false, message: 'No vendor linked to this account' });
    const { name, contact, email, address } = req.body;
    success(res, await vendorService.update(user.vendor.toString(), { name, contact, email, address }));
  } catch (e) { next(e); }
};

// Vendor gets orders assigned to their vendor
const getVendorOrders = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user?.vendor) return res.status(404).json({ success: false, message: 'No vendor linked to this account' });
    const orders = await Order.find({ vendor: user.vendor })
      .populate('vendor')
      .populate({ path: 'driver', populate: { path: 'user', select: 'name email' } })
      .populate('items.sku');
    success(res, orders);
  } catch (e) { next(e); }
};

// Vendor assigns a driver to one of their orders
const vendorAssignDriver = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user?.vendor) return res.status(404).json({ success: false, message: 'No vendor linked to this account' });
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.vendor?.toString() !== user.vendor.toString())
      return res.status(403).json({ success: false, message: 'This order does not belong to your vendor' });
    const { driverId } = req.body;
    if (!driverId) return res.status(400).json({ success: false, message: 'driverId is required' });
    const updated = await Order.findByIdAndUpdate(
      req.params.orderId,
      { driver: driverId, status: 'assigned' },
      { new: true }
    ).populate('vendor').populate({ path: 'driver', populate: { path: 'user', select: 'name email' } });
    success(res, updated);
  } catch (e) { next(e); }
};

module.exports = { getVendors, getVendor, createVendor, updateVendor, deleteVendor, getVendorProfile, updateVendorProfile, getVendorOrders, vendorAssignDriver };
