const driverService = require('./driver.service');
const User = require('../../models/User');
const Driver = require('../../models/Driver');
const { hashPassword } = require('../../utils/hash');
const { success } = require('../../utils/response');

const getDrivers = async (req, res, next) => {
  try {
    // Sync: find driver-role users without a linked Driver doc and create one
    const driverUsers = await User.find({ role: 'driver' });
    for (const u of driverUsers) {
      const exists = await Driver.findOne({ user: u._id });
      if (!exists) {
        await Driver.create({ user: u._id, licenseNumber: '', vehicle: '', isAvailable: true });
      }
    }
    success(res, await driverService.getAll());
  } catch (e) { next(e); }
};
const getDriver = async (req, res, next) => { try { success(res, await driverService.getById(req.params.id)); } catch (e) { next(e); } };

const createDriver = async (req, res, next) => {
  try {
    const { name, email, password, licenseNumber, vehicle, isAvailable } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'name, email and password are required' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ success: false, message: 'Email already in use' });
    const hashed = await hashPassword(password);
    const user = await User.create({ name, email, password: hashed, role: 'driver' });
    const driver = await driverService.create({ user: user._id, licenseNumber, vehicle, isAvailable: isAvailable ?? true });
    res.status(201).json({ success: true, data: { ...driver.toObject(), user: { _id: user._id, name: user.name, email: user.email } } });
  } catch (e) { next(e); }
};

const updateDriver = async (req, res, next) => { try { success(res, await driverService.update(req.params.id, req.body)); } catch (e) { next(e); } };
const updateDriverStatus = async (req, res, next) => { try { success(res, await driverService.update(req.params.id, { isAvailable: req.body.isAvailable })); } catch (e) { next(e); } };
const deleteDriver = async (req, res, next) => { try { success(res, await driverService.remove(req.params.id)); } catch (e) { next(e); } };

module.exports = { getDrivers, getDriver, createDriver, updateDriver, updateDriverStatus, deleteDriver };
