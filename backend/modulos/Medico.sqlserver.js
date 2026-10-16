// modulos/Medico.sqlserver.js — Modelo de médicos y horarios (SQL Server)
const { sql, poolPromise } = require('../config/db.sqlserver');

/**
 * Devuelve la cartilla médica completa (médicos activos + sus horarios).
 * Cada médico viene con un arreglo `horarios` con { dias, rango }.
 */
async function listarMedicos({ especialidad, dia, texto } = {}) {
  const pool = await poolPromise;

  const req = pool
    .request()
    .input('especialidad', sql.NVarChar(100), especialidad || null)
    .input('texto', sql.NVarChar(120), texto ? `%${texto}%` : null);

  // 1) Médicos activos (con filtros opcionales)
  const medicosRes = await req.query(`
    SELECT medico_id, nombre, apellido, especialidad, matricula, telefono
    FROM Medicos
    WHERE activo = 1
      AND (@especialidad IS NULL OR especialidad = @especialidad)
      AND (@texto IS NULL
           OR nombre + ' ' + apellido LIKE @texto
           OR especialidad LIKE @texto)
    ORDER BY apellido, nombre`);

  const medicos = medicosRes.recordset;
  if (medicos.length === 0) return [];

  // 2) Horarios de esos médicos (una sola consulta, sin N+1)
  const ids = medicos.map((m) => m.medico_id);
  const horariosRes = await pool
    .request()
    .query(`
      SELECT medico_id, dias, CONVERT(varchar(5), hora_inicio, 108) AS hora_inicio,
             CONVERT(varchar(5), hora_fin, 108) AS hora_fin
      FROM Horarios
      WHERE medico_id IN (${ids.join(',')})
      ORDER BY medico_id, hora_inicio`);

  const porMedico = horariosRes.recordset.reduce((acc, h) => {
    (acc[h.medico_id] = acc[h.medico_id] || []).push({
      dias: h.dias,
      rango: `${h.hora_inicio} a ${h.hora_fin} hs`,
    });
    return acc;
  }, {});

  // 3) Ensamblado + filtro por día (sobre los horarios ya cargados)
  const filtroDia = dia ? dia.toLowerCase() : null;

  return medicos
    .map((m) => ({
      id: m.medico_id,
      medicoId: m.medico_id,
      nombre: `${m.nombre} ${m.apellido}`,
      nombrePila: m.nombre,
      apellido: m.apellido,
      matricula: m.matricula,
      especialidad: m.especialidad,
      telefono: m.telefono,
      horarios: porMedico[m.medico_id] || [],
    }))
    .filter((m) => {
      if (!filtroDia || filtroDia === 'cualquier día' || filtroDia === 'cualquier dia') return true;
      return m.horarios.some((h) => h.dias.toLowerCase().includes(filtroDia));
    });
}

/** Especialidades distintas disponibles en la cartilla. */
async function listarEspecialidades() {
  const pool = await poolPromise;
  const res = await pool.request().query(`
    SELECT DISTINCT especialidad FROM Medicos
    WHERE activo = 1
    ORDER BY especialidad`);
  return res.recordset.map((r) => r.especialidad);
}

module.exports = { listarMedicos, listarEspecialidades };
