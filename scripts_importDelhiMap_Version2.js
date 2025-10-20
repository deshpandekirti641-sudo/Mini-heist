// scripts/importDelhiMap.js
const fs = require('fs');
const path = require('path');
const argv = require('minimist')(process.argv.slice(2));

const outDir = path.resolve(__dirname, '../public/assets/maps/delhi3d');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

console.log('Import pipeline template for Delhi map (premium).');
console.log('Output directory:', outDir);
console.log('Place source data in data/source/delhi/ and run your tile generator to create LOD tiles under', path.join(outDir, 'tiles'));
console.log('Generate navmesh and manifest; ensure a downloadable zip named delhi-3d-v1.zip is placed under', path.join(outDir, 'download'));