// routes/authRoutes.sqlserver.js — Rutas de autenticación (SQL Server)
const express = require('express');
const { registrar, login } = require('../controles/authController.sqlserver');

const router = express.Router();

// POST /api/auth/registro
router.post('/registro', registrar);
// Alias por compatibilidad con el frontend que envía "password"
router.post('/register', registrar);

// POST /api/auth/login
router.post('/login', login);

module.exports = router;
