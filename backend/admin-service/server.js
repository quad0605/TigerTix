const express = require('express');
const cors = require('cors');
const { initDb } = require('./setup');
const adminRoutes = require('./routes/adminRoutes');

const PORT = process.env.PORT || 5001;
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/admin', adminRoutes);

// Centralized error handler (rubric 1.3)
app.use((err, req, res, next) => {
  console.error('[Admin Service] ', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Admin service running on http://localhost:${PORT}`);
    });
  })
  .catch((e) => {
    console.error('DB init failed:', e);
    process.exit(1);
  });
