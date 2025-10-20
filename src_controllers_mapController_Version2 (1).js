// src/controllers/mapController.js
const fs = require('fs');
const path = require('path');
const project = require('../../project.json');

exports.listMaps = async (req, res) => {
  const maps = Object.values(project.maps).map((m) => ({
    id: m.id,
    title: m.title,
    premium: !!m.premium,
    center: m.center
  }));
  res.json({ maps });
};

exports.getManifest = async (req, res) => {
  const mapId = req.params.mapId;
  const mapEntry = Object.values(project.maps).find((m) => m.id === mapId);
  if (!mapEntry) return res.status(404).json({ error: 'Map not found' });

  // Try to return manifest.json from assetsPath if exists
  const manifestPath = path.join(process.cwd(), mapEntry.assetsPath || `public/assets/maps/${mapId}/`, 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    manifest.premium = !!mapEntry.premium;
    manifest.price = mapEntry.price || null;
    return res.json({ manifest });
  }

  // fallback
  res.json({
    manifest: {
      id: mapEntry.id,
      title: mapEntry.title,
      premium: !!mapEntry.premium,
      price: mapEntry.price || null,
      center: mapEntry.center,
      assetsPath: mapEntry.assetsPath
    }
  });
};

exports.getTile = async (req, res) => {
  const { mapId, z, x, y } = req.params;
  const mapEntry = Object.values(project.maps).find((m) => m.id === mapId);
  if (!mapEntry) return res.status(404).json({ error: 'Map not found' });

  // tile path expectation: public/assets/maps/<mapFolder>/tiles/{z}/{x}/{y}.glb
  const base = path.join(process.cwd(), mapEntry.assetsPath || `public/assets/maps/${mapId}/`);
  const filePath = path.join(base, 'tiles', z, x, `${y}.glb`);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Tile not found' });
  }
  res.sendFile(filePath);
};