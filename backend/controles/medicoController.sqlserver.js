// controles/medicoController.sqlserver.js — Cartilla médica (SQL Server)
const { listarMedicos, listarEspecialidades } = require('../modulos/Medico.sqlserver');

/** GET /api/medicos?especialidad=&dia=&q= */
const obtenerMedicos = async (req, res) => {
  try {
    const { especialidad, dia, q } = req.query;
    const medicos = await listarMedicos({
      especialidad: especialidad && especialidad !== 'Todas las especialidades' ? especialidad : null,
      dia: dia && dia !== 'Cualquier día' ? dia : null,
      texto: q || null,
    });
    res.json({ medicos });
  } catch (err) {
    console.error('Error al listar médicos:', err.message);
    res.status(500).json({ mensaje: 'Error del servidor al obtener la cartilla médica.' });
  }
};

/** GET /api/medicos/especialidades */
const obtenerEspecialidades = async (req, res) => {
  try {
    const especialidades = await listarEspecialidades();
    res.json({ especialidades });
  } catch (err) {
    console.error('Error al listar especialidades:', err.message);
    res.status(500).json({ mensaje: 'Error del servidor al obtener las especialidades.' });
  }
};

module.exports = { obtenerMedicos, obtenerEspecialidades };
