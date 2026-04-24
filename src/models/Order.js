const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  items: [{ sku: { type: mongoose.Schema.Types.ObjectId, ref: 'SKU' }, quantity: Number }],
  status: { type: String, enum: ['pending', 'assigned', 'in_transit', 'delivered', 'cancelled'], default: 'pending' },
  scheduledAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
