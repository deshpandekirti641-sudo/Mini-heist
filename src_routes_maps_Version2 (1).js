// src/routes/maps.js
// Map listing and manifest/tile endpoints.

const express = require('express');
const router = express.Router();
const mapController = require('../controllers/mapController');

// GET /api/maps
router.get('/', mapController.listMaps);

// GET /api/maps/:mapId/manifest
router.get('/:mapId/manifest', mapController.getManifest);

// GET /api/maps/:mapId/tiles/:z/:x/:y
router.get('/:mapId/tiles/:z/:x/:y', mapController.getTile);

module.exports = router;