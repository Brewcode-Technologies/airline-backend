const mongoose = require('mongoose');

const skuSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String, default: 'General' },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  unit: { type: String },
  price: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  image: { type: String, default: '' },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  approvedAirlines: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('SKU', skuSchema);
