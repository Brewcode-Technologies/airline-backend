const mongoose = require('mongoose');

const themeSchema = new mongoose.Schema({
  primaryColor: { type: String, default: '#1976d2' },
  secondaryColor: { type: String, default: '#dc004e' },
  logoUrl: { type: String },
  companyName: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Theme', themeSchema);
