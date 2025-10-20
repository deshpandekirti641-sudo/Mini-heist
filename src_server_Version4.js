// src/server.js
// Main server for Mini Gang Wars — serves APIs and static assets.
// Environment variables required:
// - MONGODB_URI (MongoDB connection string)
// - ADMIN_API_KEY (admin key to verify payments)
// - PORT (optional)

const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const mapsRouter = require('./routes/maps');
const purchaseRouter = require('./routes/purchase');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// API routes
app.use('/api/maps', mapsRouter);
app.use('/api/maps', purchaseRouter);

// Static assets (small client shell and previews). Heavy map tiles should be on CDN or in public/assets/maps/<map>/tiles/
app.use('/assets', express.static(path.join(__dirname, '../public/assets')));

// Start server with socket.io for real-time features
const server = require('http').createServer(app);
const io = require('socket.io')(server, { cors: { origin: '*' } });
io.on('connection', (socket) => {
  console.log('socket connected', socket.id);
  socket.on('disconnect', () => console.log('socket disconnected', socket.id));
});

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mini-gang-wars';

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server started on port ${PORT}. Maps API available at /api/maps`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = app;