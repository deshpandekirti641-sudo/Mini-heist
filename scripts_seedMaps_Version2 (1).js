// scripts/seedMaps.js
// Creates the folder structure for maps defined in project.json
const fs = require('fs');
const path = require('path');
const project = require('../project.json');

(async () => {
  try {
    console.log('Seeding map folders...');
    for (const [key, map] of Object.entries(project.maps)) {
      const dir = path.join(process.cwd(), map.assetsPath || `public/assets/maps/${map.id}/`);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        fs.mkdirSync(path.join(dir, 'tiles'), { recursive: true });
        fs.mkdirSync(path.join(dir, 'download'), { recursive: true });
        fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify({ id: map.id, title: map.title }, null, 2));
        console.log('Created', dir);
      } else {
        console.log('Exists', dir);
      }
    }
    console.log('Seed complete.');
  } catch (err) {
    console.error('seedMaps error', err);
    process.exit(1);
  }
})();