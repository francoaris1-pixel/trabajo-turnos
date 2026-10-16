// routes/turnoRoutes.sqlserver.js — Rutas de turnos (SQL Server)
const express = require('express');
const {
  auth,
  crear,
  listarMedico,
  listarPaciente,
  actualizarEstado,
} = require('../controles/turnoController.sqlserver');

const router = express.Router();

// Todas las rutas de turnos requieren token JWT
router.use(auth);

router.post('/', crear);                    // Crear turno (paciente)
router.get('/medico', listarMedico);        // Turnos del médico logueado
router.get('/paciente', listarPaciente);    // Turnos del paciente logueado
router.patch('/:id/estado', actualizarEstado); // Cambiar estado

module.exports = router;
