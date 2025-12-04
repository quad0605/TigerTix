const express = require('express');
const cors = require('cors');
const { initDb } = require('./setup');
const adminRoutes = require('./routes/adminRoutes');

const PORT = 5001; // <-- use Railway PORT

const app = express();

app.use(cors()); // allow all origins
app.use(express.json());

app.use('/api/admin', adminRoutes);

// Simple ping route to test deployment
app.get('/ping', (req, res) => res.send('pong'));

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('[Admin Service] ', err.stack || err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// DB init and server start
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Admin service running on port ${PORT}`);
    });
  })
  .catch((e) => {
    console.error('DB init failed:', e);
    process.exit(1);
  });
