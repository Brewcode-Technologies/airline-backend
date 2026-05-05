const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false, default: '' },
  role: { type: String, enum: ['admin', 'airline', 'driver', 'vendor'], default: 'airline' },
  airport: { type: String, default: '' },
  gate: { type: String, default: '' },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
