const mongoose = require('mongoose');

const punchoutSessionSchema = new mongoose.Schema({
  buyerCookie:  { type: String, required: true, unique: true },
  returnUrl:    { type: String, required: true },
  identity:     { type: String },
  expiresAt:    { type: Date, default: () => new Date(Date.now() + 60 * 60 * 1000) },
}, { timestamps: true });

module.exports = mongoose.model('PunchoutSession', punchoutSessionSchema);
