// routes/medicoRoutes.sqlserver.js — Cartilla médica (SQL Server)
const express = require('express');
const { obtenerMedicos, obtenerEspecialidades } = require('../controles/medicoController.sqlserver');

const router = express.Router();

// GET /api/medicos  (pública: la cartilla se ve sin loguearse)
router.get('/', obtenerMedicos);

// GET /api/medicos/especialidades
router.get('/especialidades', obtenerEspecialidades);

module.exports = router;
