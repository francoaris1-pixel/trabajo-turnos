// modulos/PacienteMedico.sqlserver.js — Relación paciente <-> médico
const { sql, poolPromise } = require('../config/db.sqlserver');

async function asignar(pacienteId, medicoId, esCabecera = false) {
  const pool = await poolPromise;
  await pool.request()
    .input('paciente_id', sql.Int, pacienteId)
    .input('medico_id', sql.Int, medicoId)
    .input('cabecera', sql.Bit, esCabecera)
    .query(`IF NOT EXISTS (SELECT 1 FROM PacientesMedicos WHERE paciente_id = @paciente_id AND medico_id = @medico_id)
              INSERT INTO PacientesMedicos (paciente_id, medico_id, es_medico_cabecera)
              VALUES (@paciente_id, @medico_id, @cabecera)`);
}

async function medicosDePaciente(pacienteId) {
  const pool = await poolPromise;
  const res = await pool.request()
    .input('paciente_id', sql.Int, pacienteId)
    .query(`SELECT m.medico_id, m.nombre, m.apellido, m.especialidad, m.matricula, pm.es_medico_cabecera
            FROM PacientesMedicos pm
            JOIN Medicos m ON m.medico_id = pm.medico_id
            WHERE pm.paciente_id = @paciente_id AND m.activo = 1`);
  return res.recordset;
}

module.exports = { asignar, medicosDePaciente };
