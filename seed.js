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
    { name: 'Super Admin',          email: 'admin@airline.com',       password: hashedPassword, role: 'admin' },
    { name: 'Airline Manager',      email: 'manager@airline.com',     password: hashedPassword, role: 'airline' },
    { name: 'Airline Staff',        email: 'staff@airline.com',       password: hashedPassword, role: 'airline' },
    { name: 'Ravi Kumar',           email: 'ravi@driver.com',         password: hashedPassword, role: 'driver' },
    { name: 'Suresh Babu',          email: 'suresh@driver.com',       password: hashedPassword, role: 'driver' },
    { name: 'Mahesh Reddy',         email: 'mahesh@driver.com',       password: hashedPassword, role: 'driver' },
    { name: 'Priya Sharma',         email: 'priya@driver.com',        password: hashedPassword, role: 'driver' },
    { name: 'Kiran Naidu',          email: 'kiran@driver.com',        password: hashedPassword, role: 'driver' },
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

  // ─── 2b. VENDOR USERS (linked to vendor docs) ───────────────
  await User.insertMany([
    { name: 'IndiGo Catering',    email: 'vendor1@indigo.com',    password: hashedPassword, role: 'vendor', vendor: vendors[0]._id },
    { name: 'Air India Supplies', email: 'vendor2@airindia.com',  password: hashedPassword, role: 'vendor', vendor: vendors[1]._id },
    { name: 'SpiceJet Logistics', email: 'vendor3@spicejet.com',  password: hashedPassword, role: 'vendor', vendor: vendors[2]._id },
  ]);
  console.log(`✅ Vendor users seeded: 3`);

  // ─── 3. SKUs ────────────────────────────────────────────────
  const skus = await SKU.insertMany([
    // Meals
    { code: 'SKU-MEAL-VEG-001',   name: 'Vegetarian Meal Box',       description: 'Standard veg meal for economy class',   category: 'Meals', vendor: vendors[0]._id, unit: 'box',    isActive: true, price: 12, stock: 150, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop' },
    { code: 'SKU-MEAL-NVEG-002',  name: 'Non-Vegetarian Meal Box',   description: 'Standard non-veg meal for economy',     category: 'Meals', vendor: vendors[0]._id, unit: 'box',    isActive: true, price: 15, stock: 120, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop' },
    { code: 'SKU-MEAL-PREM-003',  name: 'Premium Business Meal',     description: 'Gourmet meal for business class',        category: 'Meals', vendor: vendors[0]._id, unit: 'box',    isActive: true, price: 35, stock: 60, image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400&fit=crop' },
    // Beverages
    { code: 'SKU-BEV-WATER-004',  name: 'Mineral Water 500ml',       description: 'Packaged drinking water',                category: 'Beverages', vendor: vendors[0]._id, unit: 'bottle', isActive: true, price: 2, stock: 500, image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&h=400&fit=crop' },
    { code: 'SKU-BEV-JUICE-005',  name: 'Orange Juice 200ml',        description: 'Fresh orange juice pack',                category: 'Beverages', vendor: vendors[1]._id, unit: 'pack',   isActive: true, price: 4, stock: 300, image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=400&fit=crop' },
    { code: 'SKU-BEV-COLA-006',   name: 'Cola Can 330ml',            description: 'Chilled cola soft drink',                category: 'Beverages', vendor: vendors[1]._id, unit: 'can',    isActive: true, price: 3, stock: 400, image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&h=400&fit=crop' },
    // Snacks
    { code: 'SKU-SNACK-007',      name: 'Salted Peanuts 50g',        description: 'Roasted salted peanuts snack pack',      category: 'Snacks', vendor: vendors[1]._id, unit: 'pack',   isActive: true, price: 3, stock: 250, image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400&h=400&fit=crop' },
    { code: 'SKU-SNACK-008',      name: 'Cookies Assorted 100g',     description: 'Assorted cookies pack',                  category: 'Snacks', vendor: vendors[1]._id, unit: 'pack',   isActive: true, price: 5, stock: 200, image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop' },
    { code: 'SKU-SNACK-009',      name: 'Protein Bar 60g',           description: 'High protein energy bar',                category: 'Snacks', vendor: vendors[0]._id, unit: 'bar',    isActive: true, price: 4, stock: 180, image: 'https://images.unsplash.com/photo-1622484212850-eb596d769edc?w=400&h=400&fit=crop' },
    // Cargo
    { code: 'SKU-CARGO-010',      name: 'Cargo Box Small',           description: 'Small cargo box 30x20x15 cm',           category: 'Cargo', vendor: vendors[2]._id, unit: 'piece',  isActive: true, price: 8, stock: 100, image: 'https://images.unsplash.com/photo-1607166452427-7e4477c3a3d0?w=400&h=400&fit=crop' },
    { code: 'SKU-CARGO-011',      name: 'Cargo Box Large',           description: 'Large cargo box 60x40x30 cm',           category: 'Cargo', vendor: vendors[2]._id, unit: 'piece',  isActive: true, price: 14, stock: 75, image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=400&fit=crop' },
    // Fuel
    { code: 'SKU-FUEL-012',       name: 'Jet Fuel ATF',              description: 'Aviation turbine fuel per litre',        category: 'Fuel', vendor: vendors[3]._id, unit: 'litre',  isActive: true, price: 3, stock: 10000, image: 'https://images.unsplash.com/photo-1545262810-77515befe149?w=400&h=400&fit=crop' },
    { code: 'SKU-FUEL-013',       name: 'De-Icing Fluid 5L',        description: 'Aircraft de-icing solution',             category: 'Fuel', vendor: vendors[3]._id, unit: 'can',    isActive: true, price: 28, stock: 50, image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=400&fit=crop' },
    // Supplies
    { code: 'SKU-SUPPLY-014',     name: 'Aircraft Cleaning Kit',     description: 'Full aircraft interior cleaning kit',    category: 'Supplies', vendor: vendors[3]._id, unit: 'kit',    isActive: true, price: 45, stock: 30, image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&h=400&fit=crop' },
    { code: 'SKU-SUPPLY-015',     name: 'Crew Uniform Set',          description: 'Full crew uniform set (shirt+trouser)',  category: 'Supplies', vendor: vendors[4]._id, unit: 'set',    isActive: false, price: 85, stock: 20, image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop' },
    // Comfort
    { code: 'SKU-COMF-016',       name: 'Travel Blanket',            description: 'Soft fleece blanket for passengers',     category: 'Comfort', vendor: vendors[0]._id, unit: 'piece',  isActive: true, price: 18, stock: 80, image: 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=400&h=400&fit=crop' },
    { code: 'SKU-COMF-017',       name: 'Neck Pillow',               description: 'Memory foam travel neck pillow',         category: 'Comfort', vendor: vendors[0]._id, unit: 'piece',  isActive: true, price: 12, stock: 100, image: 'https://images.unsplash.com/photo-1592789705501-f9ae4278a9e9?w=400&h=400&fit=crop' },
    { code: 'SKU-COMF-018',       name: 'Eye Mask & Earplugs Set',   description: 'Sleep kit with eye mask and earplugs',   category: 'Comfort', vendor: vendors[1]._id, unit: 'set',    isActive: true, price: 6, stock: 200, image: 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=400&h=400&fit=crop' },
    // Safety
    { code: 'SKU-SAFE-019',       name: 'Safety Vest High-Vis',      description: 'High visibility safety vest',            category: 'Safety', vendor: vendors[4]._id, unit: 'piece',  isActive: true, price: 22, stock: 60, image: 'https://images.unsplash.com/photo-1618090583706-2a3e4e2d5e8e?w=400&h=400&fit=crop' },
    { code: 'SKU-SAFE-020',       name: 'First Aid Kit',             description: 'Compact emergency first aid kit',        category: 'Safety', vendor: vendors[2]._id, unit: 'kit',    isActive: true, price: 35, stock: 40, image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400&h=400&fit=crop' },
    { code: 'SKU-SAFE-021',       name: 'Fire Extinguisher Mini',    description: 'Portable mini fire extinguisher',        category: 'Safety', vendor: vendors[2]._id, unit: 'piece',  isActive: true, price: 55, stock: 25, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop' },
    // Hygiene
    { code: 'SKU-HYG-022',        name: 'Hand Sanitizer 100ml',      description: 'Antibacterial hand sanitizer gel',       category: 'Hygiene', vendor: vendors[1]._id, unit: 'bottle', isActive: true, price: 4, stock: 350, image: 'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=400&h=400&fit=crop' },
    { code: 'SKU-HYG-023',        name: 'Wet Wipes Pack (50)',       description: 'Antibacterial wet wipes pack',           category: 'Hygiene', vendor: vendors[1]._id, unit: 'pack',   isActive: true, price: 5, stock: 280, image: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=400&h=400&fit=crop' },
    { code: 'SKU-HYG-024',        name: 'Face Mask Box (50)',        description: 'Disposable 3-ply face masks',            category: 'Hygiene', vendor: vendors[2]._id, unit: 'box',    isActive: true, price: 12, stock: 150, image: 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=400&h=400&fit=crop' },
    // Electronics
    { code: 'SKU-ELEC-025',       name: 'USB-C Charging Cable',      description: 'Universal USB-C charging cable 1m',      category: 'Electronics', vendor: vendors[3]._id, unit: 'piece',  isActive: true, price: 8, stock: 120, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop' },
    { code: 'SKU-ELEC-026',       name: 'Power Bank 10000mAh',       description: 'Portable power bank for passengers',     category: 'Electronics', vendor: vendors[3]._id, unit: 'piece',  isActive: true, price: 25, stock: 50, image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=400&fit=crop' },
    { code: 'SKU-ELEC-027',       name: 'Noise Cancelling Earbuds',  description: 'Wireless ANC earbuds for passengers',    category: 'Electronics', vendor: vendors[4]._id, unit: 'piece',  isActive: true, price: 45, stock: 35, image: 'https://images.unsplash.com/photo-1590658268037-6bf12f8e4d12?w=400&h=400&fit=crop' },
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
  const now = new Date();
  const orders = await Order.insertMany([
    {
      orderNumber:    'ORD-2025-0001',
      vendor:         vendors[0]._id,
      driver:         drivers[0]._id,
      flightNumber:   'AI-101',
      gate:           'Gate A1',
      passengerCount: 180,
      items:          [{ sku: skus[0]._id, quantity: 50 }, { sku: skus[2]._id, quantity: 100 }],
      status:         'delivered',
      scheduledAt:    new Date('2025-07-01T08:00:00Z'),
      slaDeadline:    new Date('2025-07-01T08:22:00Z'),
    },
    {
      orderNumber:    'ORD-2025-0002',
      vendor:         vendors[1]._id,
      driver:         drivers[1]._id,
      flightNumber:   '6E-202',
      gate:           'Gate B3',
      passengerCount: 220,
      items:          [{ sku: skus[3]._id, quantity: 80 }, { sku: skus[4]._id, quantity: 60 }],
      status:         'delivered',
      scheduledAt:    new Date('2025-07-02T09:00:00Z'),
      slaDeadline:    new Date('2025-07-02T09:22:00Z'),
    },
    {
      orderNumber:    'ORD-2025-0003',
      vendor:         vendors[2]._id,
      driver:         drivers[2]._id,
      flightNumber:   'SG-303',
      gate:           'Gate C5',
      passengerCount: 160,
      items:          [{ sku: skus[6]._id, quantity: 20 }, { sku: skus[7]._id, quantity: 10 }],
      status:         'in_transit',
      scheduledAt:    new Date('2025-07-10T10:00:00Z'),
      slaDeadline:    new Date('2025-07-10T10:22:00Z'),
    },
    {
      orderNumber:    'ORD-2025-0004',
      vendor:         vendors[3]._id,
      driver:         drivers[3]._id,
      flightNumber:   'UK-404',
      gate:           'Gate D2',
      passengerCount: 140,
      items:          [{ sku: skus[8]._id, quantity: 500 }],
      status:         'assigned',
      scheduledAt:    new Date('2025-07-12T06:00:00Z'),
      slaDeadline:    new Date(now.getTime() + 18 * 60 * 1000),
    },
    {
      orderNumber:    'ORD-2025-0005',
      vendor:         vendors[0]._id,
      driver:         null,
      flightNumber:   'AI-505',
      gate:           'Gate A4',
      passengerCount: 200,
      items:          [{ sku: skus[1]._id, quantity: 40 }, { sku: skus[5]._id, quantity: 30 }],
      status:         'pending',
      scheduledAt:    new Date('2025-07-15T07:00:00Z'),
      slaDeadline:    new Date(now.getTime() + 22 * 60 * 1000),
    },
    {
      orderNumber:    'ORD-2025-0006',
      vendor:         vendors[1]._id,
      driver:         drivers[0]._id,
      flightNumber:   '6E-606',
      gate:           'Gate B7',
      passengerCount: 190,
      items:          [{ sku: skus[9]._id, quantity: 5 }],
      status:         'delivered',
      scheduledAt:    new Date('2025-07-05T11:00:00Z'),
      slaDeadline:    new Date('2025-07-05T11:22:00Z'),
    },
    {
      orderNumber:    'ORD-2025-0007',
      vendor:         vendors[2]._id,
      driver:         null,
      flightNumber:   'SG-707',
      gate:           'Gate C1',
      passengerCount: 130,
      items:          [{ sku: skus[11]._id, quantity: 15 }],
      status:         'cancelled',
      scheduledAt:    new Date('2025-07-08T08:30:00Z'),
      slaDeadline:    new Date('2025-07-08T08:52:00Z'),
    },
    {
      orderNumber:    'ORD-2025-0008',
      vendor:         vendors[3]._id,
      driver:         drivers[1]._id,
      flightNumber:   'UK-808',
      gate:           'Gate D6',
      passengerCount: 175,
      items:          [{ sku: skus[0]._id, quantity: 70 }, { sku: skus[2]._id, quantity: 70 }],
      status:         'pending',
      scheduledAt:    new Date('2025-07-18T09:00:00Z'),
      slaDeadline:    new Date(now.getTime() + 20 * 60 * 1000),
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
  console.log('   Vendor  : vendor1@indigo.com');
  console.log('   Vendor  : vendor2@airindia.com');
  console.log('   Vendor  : vendor3@spicejet.com');

  await mongoose.disconnect();
  console.log('\n✅ Seeding complete!');
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  mongoose.disconnect();
  process.exit(1);
});
