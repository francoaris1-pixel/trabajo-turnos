// controles/turnoController.sqlserver.js — Turnos (SQL Server)
const jwt = require('jsonwebtoken');
const { crearTurno, listarPorMedico, listarPorPaciente, cambiarEstado } = require('../modulos/Turno.sqlserver');

const JWT_SECRET = process.env.JWT_SECRET;

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ mensaje: 'Token requerido.' });
  try {
    req.usuario = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ mensaje: 'Token inválido o expirado.' });
  }
}

const crear = async (req, res) => {
  try {
    const { medicoId, fecha, hora, motivo } = req.body;
    if (!medicoId || !fecha || !hora) return res.status(400).json({ mensaje: 'Faltan datos del turno.' });

    // Obtener el paciente_id del usuario logueado
    const { poolPromise } = require('../config/db.sqlserver');
    const pool = await poolPromise;
    const r = await pool.request()
      .input('usuario_id', sql.Int, req.usuario.usuario_id)
      .query('SELECT paciente_id FROM Pacientes WHERE usuario_id = @usuario_id');
    const paciente = r.recordset[0];
    if (!paciente) return res.status(403).json({ mensaje: 'El usuario no es paciente.' });

    const turno = await crearTurno({ pacienteId: paciente.paciente_id, medicoId, fecha, hora, motivo });
    res.status(201).json({ turno });
  } catch (err) {
    res.status(err.status || 500).json({ mensaje: err.message || 'Error al crear el turno.' });
  }
};

const listarMedico = async (req, res) => {
  try {
    const { poolPromise } = require('../config/db.sqlserver');
    const pool = await poolPromise;
    const r = await pool.request()
      .input('usuario_id', sql.Int, req.usuario.usuario_id)
      .query('SELECT medico_id FROM Medicos WHERE usuario_id = @usuario_id');
    const medico = r.recordset[0];
    if (!medico) return res.status(403).json({ mensaje: 'El usuario no es médico.' });

    const turnos = await listarPorMedico(medico.medico_id, req.query.fecha);
    res.json({ turnos });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al listar turnos.' });
  }
};

const listarPaciente = async (req, res) => {
  try {
    const { poolPromise } = require('../config/db.sqlserver');
    const pool = await poolPromise;
    const r = await pool.request()
      .input('usuario_id', sql.Int, req.usuario.usuario_id)
      .query('SELECT paciente_id FROM Pacientes WHERE usuario_id = @usuario_id');
    const paciente = r.recordset[0];
    if (!paciente) return res.status(403).json({ mensaje: 'El usuario no es paciente.' });

    const turnos = await listarPorPaciente(paciente.paciente_id);
    res.json({ turnos });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al listar turnos.' });
  }
};

const actualizarEstado = async (req, res) => {
  try {
    const { estado } = req.body;
    const turno = await cambiarEstado(Number(req.params.id), estado);
    if (!turno) return res.status(404).json({ mensaje: 'Turno no encontrado.' });
    res.json({ turno });
  } catch (err) {
    res.status(err.status || 500).json({ mensaje: err.message || 'Error al actualizar el turno.' });
  }
};

module.exports = { auth, crear, listarMedico, listarPaciente, actualizarEstado };
