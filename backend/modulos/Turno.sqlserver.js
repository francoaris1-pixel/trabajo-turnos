// modulos/Turno.sqlserver.js — Modelo de turnos (SQL Server)
const { sql, poolPromise } = require('../config/db.sqlserver');

// Estados válidos según el frontend: pendiente | atendido | cancelado
const ESTADOS = ['pendiente', 'atendido', 'cancelado'];

async function crearTurno({ pacienteId, medicoId, fecha, hora, motivo }) {
  const pool = await poolPromise;
  try {
    const res = await pool.request()
      .input('paciente_id', sql.Int, pacienteId)
      .input('medico_id', sql.Int, medicoId)
      .input('fecha', sql.Date, fecha)
      .input('hora', sql.Time, hora)
      .input('motivo', sql.NVarChar(300), motivo || null)
      .query(`INSERT INTO Turnos (paciente_id, medico_id, fecha, hora, motivo)
              OUTPUT INSERTED.turno_id, INSERTED.fecha, INSERTED.hora, INSERTED.estado
              VALUES (@paciente_id, @medico_id, @fecha, @hora, @motivo)`);
    return res.recordset[0];
  } catch (err) {
    // Duplico/conflicto de horario: viola el índice filtrado UNIQUE
    if (err.number === 2601 || err.number === 2627) {
      const e = new Error('Conflicto de horario: ya existe un turno activo para ese médico y horario.');
      e.status = 409;
      throw e;
    }
    throw err;
  }
}

async function listarPorMedico(medicoId, fecha) {
  const pool = await poolPromise;
  const res = await pool.request()
    .input('medico_id', sql.Int, medicoId)
    .input('fecha', sql.Date, fecha || null)
    .query(`SELECT t.turno_id, t.fecha, t.hora, t.estado, t.motivo,
                   p.nombre + ' ' + p.apellido AS paciente, p.dni
            FROM Turnos t
            JOIN Pacientes p ON p.paciente_id = t.paciente_id
            WHERE t.medico_id = @medico_id
              AND (@fecha IS NULL OR t.fecha = @fecha)
            ORDER BY t.fecha DESC, t.hora`);
  return res.recordset;
}

async function listarPorPaciente(pacienteId) {
  const pool = await poolPromise;
  const res = await pool.request()
    .input('paciente_id', sql.Int, pacienteId)
    .query(`SELECT t.turno_id, t.fecha, CONVERT(varchar(5), t.hora, 108) AS hora,
                   t.estado, m.nombre + ' ' + m.apellido AS medico, m.especialidad
            FROM Turnos t
            JOIN Medicos m ON m.medico_id = t.medico_id
            WHERE t.paciente_id = @paciente_id
            ORDER BY t.fecha DESC, t.hora`);
  return res.recordset;
}

async function cambiarEstado(turnoId, estado) {
  if (!ESTADOS.includes(estado)) {
    const e = new Error('Estado inválido.');
    e.status = 400;
    throw e;
  }
  const pool = await poolPromise;
  const res = await pool.request()
    .input('turno_id', sql.Int, turnoId)
    .input('estado', sql.NVarChar(15), estado)
    .query(`UPDATE Turnos SET estado = @estado
            OUTPUT INSERTED.turno_id, INSERTED.estado
            WHERE turno_id = @turno_id`);
  return res.recordset[0] || null;
}

module.exports = { crearTurno, listarPorMedico, listarPorPaciente, cambiarEstado, ESTADOS };
