// server.sqlserver.js — Servidor principal (SQL Server)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { poolPromise } = require('./config/db.sqlserver');
const authRoutes = require('./routes/authRoutes.sqlserver');
const turnoRoutes = require('./routes/turnoRoutes.sqlserver');
const medicoRoutes = require('./routes/medicoRoutes.sqlserver');

const app = express();
app.use(cors());
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
