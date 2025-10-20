// src/models/payment.js
const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    mapId: { type: String, required: true, index: true },
    utr: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    upiId: { type: String },
    submittedAt: { type: Date, default: Date.now },
    verified: { type: Boolean, default: false },
    verifiedAt: { type: Date },
    verifierNote: { type: String },
    accessToken: { type: String, index: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', PaymentSchema);