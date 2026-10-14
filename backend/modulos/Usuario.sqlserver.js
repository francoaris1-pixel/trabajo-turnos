// modulos/Usuario.sqlserver.js — Modelo de usuario (SQL Server)
// Contraseñas SIEMPRE hasheadas con bcrypt (requisito #6). Nunca texto plano.
const { sql, poolPromise } = require('../config/db.sqlserver');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

async function crearUsuario({ email, contrasena, rol = 'paciente', datosPaciente = null, datosMedico = null }) {
  const pool = await poolPromise;
  const hash = await bcrypt.hash(contrasena, SALT_ROUNDS);

  // Transacción: usuario + (paciente o médico) se crean juntos
  const trx = new sql.Transaction(pool);
  await trx.begin();
  try {
    const req = new sql.Request(trx);
    const res = await req
      .input('email', sql.NVarChar(150), email)
      .input('hash', sql.NVarChar(200), hash)
      .input('rol', sql.NVarChar(20), rol)
      .query(`INSERT INTO Usuarios (email, contrasena_hash, rol)
              OUTPUT INSERTED.usuario_id, INSERTED.email, INSERTED.rol
              VALUES (@email, @hash, @rol)`);
    const usuario = res.recordset[0];

    if (rol === 'paciente' && datosPaciente) {
      await new sql.Request(trx)
        .input('usuario_id', sql.Int, usuario.usuario_id)
        .input('nombre', sql.NVarChar(100), datosPaciente.nombre)
        .input('apellido', sql.NVarChar(100), datosPaciente.apellido)
        .input('dni', sql.VarChar(8), datosPaciente.dni)
        .input('fecha_nacimiento', sql.Date, datosPaciente.fechaNacimiento)
        .input('telefono', sql.NVarChar(20), datosPaciente.telefono || null)
        .query(`INSERT INTO Pacientes (usuario_id, nombre, apellido, dni, fecha_nacimiento, telefono)
                VALUES (@usuario_id, @nombre, @apellido, @dni, @fecha_nacimiento, @telefono)`);
    }
    if (rol === 'medico' && datosMedico) {
      await new sql.Request(trx)
        .input('usuario_id', sql.Int, usuario.usuario_id)
        .input('nombre', sql.NVarChar(100), datosMedico.nombre)
        .input('apellido', sql.NVarChar(100), datosMedico.apellido)
        .input('matricula', sql.NVarChar(20), datosMedico.matricula)
        .input('especialidad', sql.NVarChar(100), datosMedico.especialidad)
        .input('telefono', sql.NVarChar(20), datosMedico.telefono || null)
        .query(`INSERT INTO Medicos (usuario_id, nombre, apellido, matricula, especialidad, telefono)
                VALUES (@usuario_id, @nombre, @apellido, @matricula, @especialidad, @telefono)`);
    }
    await trx.commit();
    return usuario;
  } catch (err) {
    await trx.rollback();
    throw err;
  }
}

async function buscarPorEmail(email) {
  const pool = await poolPromise;
  const res = await pool.request()
    .input('email', sql.NVarChar(150), email)
    .query('SELECT usuario_id, email, contrasena_hash, rol FROM Usuarios WHERE email = @email');
  return res.recordset[0] || null;
}

async function verificarContrasena(contrasenaPlano, hash) {
  return bcrypt.compare(contrasenaPlano, hash);
}

module.exports = { crearUsuario, buscarPorEmail, verificarContrasena };
