const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false, default: '' },
  role: { type: String, enum: ['admin', 'airline', 'driver'], default: 'airline' },
  airport: { type: String, default: '' },
  gate: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
