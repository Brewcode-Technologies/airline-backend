const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String, default: 'General' },
  price: { type: Number, default: 0 },
  duration: { type: String, default: '' }, // e.g. "30 min", "1 hour", "Per trip"
  image: { type: String, default: '' },
  icon: { type: String, default: '' }, // emoji or icon name
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
