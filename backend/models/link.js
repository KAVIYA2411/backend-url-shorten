
const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
  originalLink: { type: String, required: true },
  shortLink: { type: String, required: true },
  ipAddress: { type: String, required: false },
  userDevice: { type: String, required: false },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Link', linkSchema);
