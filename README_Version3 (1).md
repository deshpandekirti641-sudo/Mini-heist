```markdown
# Mini Gang Wars — Online (Mumbai + Delhi)

This repository scaffolds an online-first mini‑GTA-style game for India:
- Maps: Mumbai (free, realistic transit) and Delhi (premium, INR 30).
- Streaming LOD tiles (glb), purchase flow (UTR submission + admin verification), admin control panel, simple client shells.

Important environment variables:
- MONGODB_URI — MongoDB connection string
- ADMIN_API_KEY — secret key used to verify purchases
- PORT — optional server port (default 4000)

Quick start (development)
1. git clone <repo>
2. npm run run-npm-install
3. Copy .env.example -> .env and set MONGODB_URI and ADMIN_API_KEY
4. npm run seed:maps
5. npm run dev
6. Open map-access UI: http://localhost:6000 (npm run access-ui)
7. Open admin UI: http://localhost:6001 (npm run admin-ui)

Notes
- Place map tiles under public/assets/maps/<map>/tiles/{z}/{x}/{y}.glb
- Place downloadable zips under public/assets/maps/<map>/download/<mapId>.zip
- For production, host heavy assets in object storage + CDN and return signed URLs in downloadMap.
- UTRs are enforced as unique — a UTR cannot be reused.

Security
- Never commit ADMIN_API_KEY or production database URIs to the repo.
- Protect verification access; use a secure admin UI and rotate keys.

Optimization & 400 MB client budget
- Stream tiles; keep high LOD tiles on CDN.
- Use DRACO + meshopt, texture atlases (webp), compressed audio (ogg).
- Cache tiles in client IndexedDB.

Contact
- For support: deshpandekirti641@gmail.com
- Payment UPI (manual flow): 8976096360-2@axl (players pay INR 30 for Delhi map)
```