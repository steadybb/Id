const express = require('express');
const path = require('path');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Keep-alive route for self-ping ---
app.get('/ping', (req, res) => {
  res.status(200).send('ok');
});

// Serve all static files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to index.html for any other route (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Create HTTP server (express automatically enables keep-alive connections)
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`✅ ID Server running at http://localhost:${PORT}`);
  console.log(`📁 Static folder: public/`);
  console.log(`🖼️  Place your ID photo as 'public/id_photo.jpg'`);

  // --- SELF-PING KEEP-ALIVE (prevents idle sleep on free tiers) ---
  const pingInterval = 4 * 60 * 1000; // 4 minutes (adjust as needed)
  const pingUrl = `http://localhost:${PORT}/ping`;

  setInterval(() => {
    http.get(pingUrl, (res) => {
      console.log(`🔄 Keep-alive ping sent at ${new Date().toISOString()} - status: ${res.statusCode}`);
      res.resume(); // consume response data to free memory
    }).on('error', (err) => {
      console.error(`⚠️ Keep-alive ping failed: ${err.message}`);
    });
  }, pingInterval);

  console.log(`⏱️  Keep-alive ping every ${pingInterval / 1000} seconds to ${pingUrl}`);
});

// Graceful shutdown (optional)
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
