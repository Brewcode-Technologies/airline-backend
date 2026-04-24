require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./src/models/User');
const Vendor = require('./src/models/Vendor');
const SKU = require('./src/models/SKU');
const Order = require('./src/models/Order');
const Driver = require('./src/models/Driver');
const Location = require('./src/models/Location');
const DeliveryProof = require('./src/models/DeliveryProof');
const Theme = require('./src/models/Theme');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear all collections
  await Promise.all([
    User.deleteMany({}),
    Vendor.deleteMany({}),
    SKU.deleteMany({}),
    Order.deleteMany({}),
    Driver.deleteMany({}),
    Location.deleteMany({}),
    DeliveryProof.deleteMany({}),
    Theme.deleteMany({}),
  ]);
  console.log('Cleared all collections');

  // ─── 1. USERS ───────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = await User.insertMany([
    { name: 'Super Admin',     email: 'admin@airline.com',    password: hashedPassword, role: 'admin' },
    { name: 'Airline Manager', email: 'manager@airline.com',  password: hashedPassword, role: 'airline' },
    { name: 'Airline Staff',   email: 'staff@airline.com',    password: hashedPassword, role: 'airline' },
    { name: 'Ravi Kumar',      email: 'ravi@driver.com',      password: hashedPassword, role: 'driver' },
    { name: 'Suresh Babu',     email: 'suresh@driver.com',    password: hashedPassword, role: 'driver' },
    { name: 'Mahesh Reddy',    email: 'mahesh@driver.com',    password: hashedPassword, role: 'driver' },
    { name: 'Priya Sharma',    email: 'priya@driver.com',     password: hashedPassword, role: 'driver' },
    { name: 'Kiran Naidu',     email: 'kiran@driver.com',     password: hashedPassword, role: 'driver' },
  ]);
  console.log(`✅ Users seeded: ${users.length}`);

  // ─── 2. VENDORS ─────────────────────────────────────────────
  const vendors = await Vendor.insertMany([
    { name: 'IndiGo Catering Services',   email: 'catering@indigo.com',    contact: '9876543210', address: 'Terminal 1, IGI Airport, Delhi',     isActive: true },
    { name: 'Air India Ground Supplies',  email: 'supplies@airindia.com',  contact: '9876543211', address: 'Hangar 4, CSIA Airport, Mumbai',      isActive: true },
    { name: 'SpiceJet Logistics',         email: 'logistics@spicejet.com', contact: '9876543212', address: 'Gate 7, RGIA Airport, Hyderabad',     isActive: true },
    { name: 'Vistara Cargo Solutions',    email: 'cargo@vistara.com',      contact: '9876543213', address: 'Cargo Hub, Kempegowda Airport, Bangalore', isActive: true },
    { name: 'GoAir Supplies Ltd',         email: 'supplies@goair.com',     contact: '9876543214', address: 'Terminal 2, Chennai Airport, Chennai', isActive: false },
  ]);
  console.log(`✅ Vendors seeded: ${vendors.length}`);

  // ─── 3. SKUs ────────────────────────────────────────────────
  const skus = await SKU.insertMany([
    { code: 'SKU-MEAL-VEG-001',   name: 'Vegetarian Meal Box',       description: 'Standard veg meal for economy class',   vendor: vendors[0]._id, unit: 'box',    isActive: true },
    { code: 'SKU-MEAL-NVEG-002',  name: 'Non-Vegetarian Meal Box',   description: 'Standard non-veg meal for economy',     vendor: vendors[0]._id, unit: 'box',    isActive: true },
    { code: 'SKU-BEV-WATER-003',  name: 'Mineral Water 500ml',       description: 'Packaged drinking water',                vendor: vendors[0]._id, unit: 'bottle', isActive: true },
    { code: 'SKU-BEV-JUICE-004',  name: 'Orange Juice 200ml',        description: 'Fresh orange juice pack',                vendor: vendors[1]._id, unit: 'pack',   isActive: true },
    { code: 'SKU-SNACK-001',      name: 'Salted Peanuts 50g',        description: 'Roasted salted peanuts snack pack',      vendor: vendors[1]._id, unit: 'pack',   isActive: true },
    { code: 'SKU-SNACK-002',      name: 'Cookies Assorted 100g',     description: 'Assorted cookies pack',                 vendor: vendors[1]._id, unit: 'pack',   isActive: true },
    { code: 'SKU-CARGO-BOX-001',  name: 'Cargo Box Small',           description: 'Small cargo box 30x20x15 cm',           vendor: vendors[2]._id, unit: 'piece',  isActive: true },
    { code: 'SKU-CARGO-BOX-002',  name: 'Cargo Box Large',           description: 'Large cargo box 60x40x30 cm',           vendor: vendors[2]._id, unit: 'piece',  isActive: true },
    { code: 'SKU-FUEL-JET-001',   name: 'Jet Fuel ATF',              description: 'Aviation turbine fuel per litre',       vendor: vendors[3]._id, unit: 'litre',  isActive: true },
    { code: 'SKU-CLEAN-001',      name: 'Aircraft Cleaning Kit',     description: 'Full aircraft interior cleaning kit',   vendor: vendors[3]._id, unit: 'kit',    isActive: true },
    { code: 'SKU-UNIFORM-001',    name: 'Crew Uniform Set',          description: 'Full crew uniform set (shirt+trouser)', vendor: vendors[4]._id, unit: 'set',    isActive: false },
    { code: 'SKU-SAFETY-001',     name: 'Safety Vest High-Vis',      description: 'High visibility safety vest',           vendor: vendors[4]._id, unit: 'piece',  isActive: true },
  ]);
  console.log(`✅ SKUs seeded: ${skus.length}`);

  // ─── 4. DRIVERS ─────────────────────────────────────────────
  const driverUsers = users.filter(u => u.role === 'driver');
  const drivers = await Driver.insertMany([
    { user: driverUsers[0]._id, licenseNumber: 'DL-AP-2019-001234', vehicle: 'Tata Ace Truck',      isAvailable: true },
    { user: driverUsers[1]._id, licenseNumber: 'DL-TS-2020-005678', vehicle: 'Mahindra Bolero',     isAvailable: true },
    { user: driverUsers[2]._id, licenseNumber: 'DL-MH-2018-009012', vehicle: 'Ashok Leyland Truck', isAvailable: false },
    { user: driverUsers[3]._id, licenseNumber: 'DL-KA-2021-003456', vehicle: 'Force Traveller Van', isAvailable: true },
    { user: driverUsers[4]._id, licenseNumber: 'DL-TN-2017-007890', vehicle: 'Tata 407 Mini Truck', isAvailable: false },
  ]);
  console.log(`✅ Drivers seeded: ${drivers.length}`);

  // ─── 5. ORDERS ──────────────────────────────────────────────
  const orders = await Order.insertMany([
    {
      orderNumber: 'ORD-2025-0001',
      vendor: vendors[0]._id,
      driver: drivers[0]._id,
      items: [
        { sku: skus[0]._id, quantity: 50 },
        { sku: skus[2]._id, quantity: 100 },
      ],
      status: 'delivered',
      scheduledAt: new Date('2025-07-01T08:00:00Z'),
    },
    {
      orderNumber: 'ORD-2025-0002',
      vendor: vendors[1]._id,
      driver: drivers[1]._id,
      items: [
        { sku: skus[3]._id, quantity: 80 },
        { sku: skus[4]._id, quantity: 60 },
      ],
      status: 'delivered',
      scheduledAt: new Date('2025-07-02T09:00:00Z'),
    },
    {
      orderNumber: 'ORD-2025-0003',
      vendor: vendors[2]._id,
      driver: drivers[2]._id,
      items: [
        { sku: skus[6]._id, quantity: 20 },
        { sku: skus[7]._id, quantity: 10 },
      ],
      status: 'in_transit',
      scheduledAt: new Date('2025-07-10T10:00:00Z'),
    },
    {
      orderNumber: 'ORD-2025-0004',
      vendor: vendors[3]._id,
      driver: drivers[3]._id,
      items: [
        { sku: skus[8]._id, quantity: 500 },
      ],
      status: 'assigned',
      scheduledAt: new Date('2025-07-12T06:00:00Z'),
    },
    {
      orderNumber: 'ORD-2025-0005',
      vendor: vendors[0]._id,
      driver: null,
      items: [
        { sku: skus[1]._id, quantity: 40 },
        { sku: skus[5]._id, quantity: 30 },
      ],
      status: 'pending',
      scheduledAt: new Date('2025-07-15T07:00:00Z'),
    },
    {
      orderNumber: 'ORD-2025-0006',
      vendor: vendors[1]._id,
      driver: drivers[0]._id,
      items: [
        { sku: skus[9]._id, quantity: 5 },
      ],
      status: 'delivered',
      scheduledAt: new Date('2025-07-05T11:00:00Z'),
    },
    {
      orderNumber: 'ORD-2025-0007',
      vendor: vendors[2]._id,
      driver: null,
      items: [
        { sku: skus[11]._id, quantity: 15 },
      ],
      status: 'cancelled',
      scheduledAt: new Date('2025-07-08T08:30:00Z'),
    },
    {
      orderNumber: 'ORD-2025-0008',
      vendor: vendors[3]._id,
      driver: drivers[1]._id,
      items: [
        { sku: skus[0]._id, quantity: 70 },
        { sku: skus[2]._id, quantity: 70 },
      ],
      status: 'pending',
      scheduledAt: new Date('2025-07-18T09:00:00Z'),
    },
  ]);
  console.log(`✅ Orders seeded: ${orders.length}`);

  // ─── 6. LOCATIONS (Tracking) ────────────────────────────────
  const deliveredOrders = orders.filter(o => o.status === 'delivered' || o.status === 'in_transit');
  const locationData = [];

  deliveredOrders.forEach((order, i) => {
    const driver = drivers[i % drivers.length];
    const baseCoords = [
      { lat: 17.2403, lng: 78.4294 },
      { lat: 17.2850, lng: 78.4500 },
      { lat: 17.3200, lng: 78.4700 },
      { lat: 17.3600, lng: 78.4867 },
      { lat: 17.3850, lng: 78.4867 },
    ];
    baseCoords.forEach((coord, j) => {
      locationData.push({
        order: order._id,
        driver: driver._id,
        coordinates: coord,
        recordedAt: new Date(Date.now() - (5 - j) * 10 * 60 * 1000),
      });
    });
  });

  const locations = await Location.insertMany(locationData);
  console.log(`✅ Locations seeded: ${locations.length}`);

  // ─── 7. DELIVERY PROOFS ─────────────────────────────────────
  const deliveredOrdersList = orders.filter(o => o.status === 'delivered');
  const proofs = await DeliveryProof.insertMany(
    deliveredOrdersList.map((order, i) => ({
      order: order._id,
      driver: drivers[i % drivers.length]._id,
      imageUrl: `https://storage.airline-logistics.com/proofs/${order.orderNumber}.jpg`,
      signature: `base64_signature_${order.orderNumber}`,
      notes: `Delivered successfully to gate. Received by ground staff. Order ${order.orderNumber} completed.`,
      deliveredAt: new Date(order.scheduledAt.getTime() + 2 * 60 * 60 * 1000),
    }))
  );
  console.log(`✅ Delivery Proofs seeded: ${proofs.length}`);

  // ─── 8. THEME ───────────────────────────────────────────────
  const theme = await Theme.create({
    primaryColor: '#1976d2',
    secondaryColor: '#dc004e',
    logoUrl: 'https://storage.airline-logistics.com/logo.png',
    companyName: 'Airline Logistics Management',
  });
  console.log(`✅ Theme seeded`);

  // ─── SUMMARY ────────────────────────────────────────────────
  console.log('\n========== SEED SUMMARY ==========');
  console.log(`👤 Users          : ${users.length}`);
  console.log(`🏢 Vendors        : ${vendors.length}`);
  console.log(`📦 SKUs           : ${skus.length}`);
  console.log(`🚗 Drivers        : ${drivers.length}`);
  console.log(`📋 Orders         : ${orders.length}`);
  console.log(`📍 Locations      : ${locations.length}`);
  console.log(`✅ Delivery Proofs: ${proofs.length}`);
  console.log(`🎨 Theme          : 1`);
  console.log('==================================');
  console.log('\n🔑 Login credentials (all passwords: password123)');
  console.log('   Admin   : admin@airline.com');
  console.log('   Airline : manager@airline.com');
  console.log('   Driver  : ravi@driver.com');

  await mongoose.disconnect();
  console.log('\n✅ Seeding complete!');
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  mongoose.disconnect();
  process.exit(1);
});
