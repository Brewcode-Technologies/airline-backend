const mongoose = require('mongoose');

const deliveryProofSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  imageUrl: { type: String },
  signature: { type: String },
  notes: { type: String },
  deliveredAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('DeliveryProof', deliveryProofSchema);
