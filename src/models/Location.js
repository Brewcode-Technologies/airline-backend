const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  coordinates: { lat: Number, lng: Number },
  recordedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Location', locationSchema);
