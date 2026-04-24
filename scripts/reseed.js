require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../src/models/User');
const Vendor = require('../src/models/Vendor');
const SKU = require('../src/models/SKU');
const Order = require('../src/models/Order');
const Driver = require('../src/models/Driver');
const Location = require('../src/models/Location');
const DeliveryProof = require('../src/models/DeliveryProof');
const Theme = require('../src/models/Theme');

const run = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
  }

  // Only clear non-seed data — delete records NOT in the original seed
  // by deleting only cypress test records (emails containing @test.com or codes containing SKU-CYPRESS)
  await User.deleteMany({ email: /@test\.com$/ });
  await Vendor.deleteMany({ email: /@test\.com$/ });
  await SKU.deleteMany({ code: /^SKU-[0-9]{13}/ }); // timestamp-based codes from tests
  await Order.deleteMany({ orderNumber: /^ORD-(?!2025)/ }); // keep ORD-2025-* seed orders
  await Driver.deleteMany({ licenseNumber: /^DL-(?!AP|TS|MH|KA|TN)/ }); // keep seed license patterns

  // Remove DeliveryProof records that reference non-existent orders
  const validOrderIds = (await Order.find({}, '_id')).map(o => o._id);
  await DeliveryProof.deleteMany({ order: { $nin: validOrderIds } });

  // Restore seed users if deleted
  const hashedPassword = await bcrypt.hash('password123', 10);
  const seedEmails = [
    'admin@airline.com', 'manager@airline.com', 'staff@airline.com',
    'ravi@driver.com', 'suresh@driver.com', 'mahesh@driver.com',
    'priya@driver.com', 'kiran@driver.com',
  ];

  for (const email of seedEmails) {
    const exists = await User.findOne({ email });
    if (!exists) {
      const seedData = {
        'admin@airline.com':   { name: 'Super Admin',     role: 'admin' },
        'manager@airline.com': { name: 'Airline Manager', role: 'airline' },
        'staff@airline.com':   { name: 'Airline Staff',   role: 'airline' },
        'ravi@driver.com':     { name: 'Ravi Kumar',      role: 'driver' },
        'suresh@driver.com':   { name: 'Suresh Babu',     role: 'driver' },
        'mahesh@driver.com':   { name: 'Mahesh Reddy',    role: 'driver' },
        'priya@driver.com':    { name: 'Priya Sharma',    role: 'driver' },
        'kiran@driver.com':    { name: 'Kiran Naidu',     role: 'driver' },
      };
      await User.create({ email, password: hashedPassword, ...seedData[email] });
    }
  }

  // Restore cypress test admin user
  const cypressAdmin = await User.findOne({ email: 'cypress_admin@test.com' });
  if (!cypressAdmin) {
    await User.create({
      name: 'Cypress Admin',
      email: 'cypress_admin@test.com',
      password: hashedPassword,
      role: 'admin',
    });
  }

  console.log('✅ Reseed complete — seed data protected, cypress user ready');
  return true;
};

module.exports = { run };
