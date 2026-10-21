// server.sqlserver.js — Servidor principal (SQL Server)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { poolPromise } = require('./config/db.sqlserver');
const authRoutes = require('./routes/authRoutes.sqlserver');
const turnoRoutes = require('./routes/turnoRoutes.sqlserver');
const medicoRoutes = require('./routes/medicoRoutes.sqlserver');

const app = express();

// ---- CORS ----
// CORS_ORIGIN admite varios orígenes separados por coma.
// Si no se define, se permite cualquier origen (útil en desarrollo).
const origenesPermitidos = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: origenesPermitidos.length > 0 ? origenesPermitidos : true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
    optionsSuccessStatus: 204, // evita problemas con navegadores viejos en el preflight
  })
);

app.use(express.json());

app.get('/', (req, res) => res.json({ mensaje: 'API Trabajo Turnos (SQL Server) funcionando.' }));
app.get('/health', async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request().query('SELECT 1 AS ok');
    res.json({ db: 'ok' });
  } catch {
    res.status(500).json({ db: 'error' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/turnos', turnoRoutes);
app.use('/api/medicos', medicoRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Servidor en http://localhost:${PORT}`));
