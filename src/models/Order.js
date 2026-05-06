const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{ sku: { type: mongoose.Schema.Types.ObjectId, ref: 'SKU' }, quantity: Number }],
  status: { type: String, enum: ['pending', 'assigned', 'picked', 'enroute', 'in_transit', 'delivered', 'cancelled'], default: 'pending' },
  scheduledAt: { type: Date },
  flightNumber: { type: String },
  gate: { type: String },
  passengerCount: { type: Number },
  slaDeadline: { type: Date },
  deliveryOtp: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
