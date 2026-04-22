require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const leadRouter = require('./routes/lead');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate-limit the submit endpoint — max 10 requests per 15 min per IP
const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

// ─── Static Files (your frontend) ─────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ─── API Routes ────────────────────────────────────────────────
app.use('/api/lead', submitLimiter, leadRouter);

// ─── Serve index.html for any non-API route ────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Start Server ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Softstacks server running at http://localhost:${PORT}`);
  console.log(`📧 Admin notifications → ${process.env.ADMIN_EMAIL}`);
  console.log(`🌱 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
