require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const connectDB    = require('./src/config/db');

// ── Routes ───────────────────────────────────────────────────────────────────
const healthRoutes   = require('./src/routes/health.routes');
const authRoutes     = require('./src/routes/authRoutes');
const productRoutes  = require('./src/routes/productRoutes');

// ── Middleware ────────────────────────────────────────────────────────────────
const errorHandler = require('./src/middleware/errorHandler');

// ── Connect to MongoDB ────────────────────────────────────────────────────────
connectDB();

// ── App ───────────────────────────────────────────────────────────────────────
const app = express();

// ── Core Middleware ───────────────────────────────────────────────────────────
app.use(
  cors({
    origin: [
      process.env.CLIENT_ORIGIN || 'http://localhost:3000',
      'http://localhost:5173', // Vite dev server
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/health',    healthRoutes);
app.use('/api/auth',      authRoutes);
app.use('/api/products',  productRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ── Global Error Handler (must be last) ───────────────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
