// src/controllers/paymentController.js
const { v4: uuidv4 } = require('uuid');
const Payment = require('../models/payment');
const project = require('../../project.json');
const path = require('path');
const fs = require('fs');

exports.submitPurchase = async (req, res) => {
  try {
    const mapId = req.params.mapId;
    const { userId, utr, upiId } = req.body;
    if (!userId || !utr) return res.status(400).json({ error: 'userId and utr required' });

    const mapEntry = Object.values(project.maps).find((m) => m.id === mapId);
    if (!mapEntry) return res.status(404).json({ error: 'Map not found' });
    if (!mapEntry.premium) return res.status(400).json({ error: 'Map does not require purchase' });

    const payment = new Payment({
      userId,
      mapId,
      utr,
      amount: (mapEntry.price && mapEntry.price.amount) || 0,
      currency: (mapEntry.price && mapEntry.price.currency) || 'INR',
      upiId
    });

    await payment.save();
    return res.status(201).json({ message: 'UTR submitted and pending verification', paymentId: payment._id });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'This UTR/transaction id has already been used' });
    console.error('submitPurchase error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const adminKey = req.header('x-admin-key');
    if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) return res.status(401).json({ error: 'Unauthorized' });

    const { paymentId, utr, verify = true, verifierNote } = req.body;
    const query = paymentId ? { _id: paymentId } : { utr };
    const payment = await Payment.findOne(query);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    if (!verify) {
      payment.verified = false;
      payment.verifierNote = verifierNote || 'Rejected';
      await payment.save();
      return res.json({ message: 'Payment rejected' });
    }

    if (payment.verified) return res.status(400).json({ error: 'Payment already verified' });

    payment.verified = true;
    payment.verifiedAt = new Date();
    payment.verifierNote = verifierNote || 'Verified by admin';
    payment.accessToken = uuidv4();
    await payment.save();

    return res.json({ message: 'Payment verified', accessToken: payment.accessToken });
  } catch (err) {
    console.error('verifyPayment error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.checkAccess = async (req, res) => {
  try {
    const mapId = req.params.mapId;
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const payment = await Payment.findOne({ userId, mapId, verified: true }).sort({ verifiedAt: -1 });
    if (!payment) return res.json({ access: false });
    return res.json({ access: true, accessToken: payment.accessToken, verifiedAt: payment.verifiedAt });
  } catch (err) {
    console.error('checkAccess error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.downloadMap = async (req, res) => {
  try {
    const mapId = req.params.mapId;
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: 'token required' });

    const payment = await Payment.findOne({ accessToken: token, verified: true, mapId });
    if (!payment) return res.status(403).json({ error: 'Invalid or expired token' });

    const mapEntry = Object.values(project.maps).find((m) => m.id === mapId);
    if (!mapEntry) return res.status(404).json({ error: 'Map not found' });

    const zipName = `${mapEntry.id}.zip`;
    const localZip = path.join(process.cwd(), mapEntry.assetsPath || `public/assets/maps/${mapEntry.id}/`, 'download', zipName);
    if (!fs.existsSync(localZip)) {
      return res.status(404).json({
        error: 'Map asset not prepared',
        message: `Map zip not found at ${localZip}. Place ${zipName} under ${mapEntry.assetsPath}/download/ or host on CDN.`,
        expectedPath: localZip
      });
    }

    // Return a public assets URL path
    const publicUrl = `${mapEntry.assetsPath.replace(/^public\\//, '/').replace(/^\\//, '/') }download/${zipName}`;
    return res.json({ downloadUrl: publicUrl, note: 'Use the downloadUrl to fetch the map zip. Keep your token private.' });
  } catch (err) {
    console.error('downloadMap error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};