// scripts/verifyPayment.js
// Simple CLI to verify UTRs (admin use).
// Usage: node scripts/verifyPayment.js --utr=UTR123 --verify=true --note="OK"
const mongoose = require('mongoose');
const Payment = require('../src/models/payment');
const argv = require('minimist')(process.argv.slice(2));
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mini-gang-wars';

async function run() {
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const { utr, paymentId, verify = 'true', note } = argv;
  if (!utr && !paymentId) {
    console.error('Provide --utr or --paymentId');
    process.exit(1);
  }
  const query = paymentId ? { _id: paymentId } : { utr };
  const payment = await Payment.findOne(query);
  if (!payment) {
    console.error('Payment not found');
    process.exit(1);
  }
  if (verify === 'true') {
    if (payment.verified) {
      console.log('Already verified', payment._id);
    } else {
      payment.verified = true;
      payment.verifiedAt = new Date();
      payment.verifierNote = note || 'Verified via CLI';
      payment.accessToken = require('uuid').v4();
      await payment.save();
      console.log('Verified. Access token:', payment.accessToken);
    }
  } else {
    payment.verified = false;
    payment.verifierNote = note || 'Rejected via CLI';
    await payment.save();
    console.log('Marked rejected.');
  }
  mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  mongoose.disconnect();
  process.exit(1);
});