// src/routes/purchase.js
// Purchase flow for premium maps.

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// POST /api/maps/:mapId/purchase
router.post('/:mapId/purchase', paymentController.submitPurchase);

// POST /api/maps/:mapId/verify (ADMIN only)
router.post('/:mapId/verify', paymentController.verifyPayment);

// GET /api/maps/:mapId/access?userId=...
router.get('/:mapId/access', paymentController.checkAccess);

// GET /api/maps/:mapId/download?token=...
router.get('/:mapId/download', paymentController.downloadMap);

module.exports = router;