const mongoose = require('mongoose');

const skuSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  unit: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('SKU', skuSchema);
