// scripts/seed-demo.sqlserver.js — Crea usuarios DEMO (paciente y médico) para probar los paneles.
//
// Uso:
//   cd backend
//   node scripts/seed-demo.sqlserver.js
//
// Qué hace:
//   - Usa la misma conexión y el mismo bcrypt que la app (contraseñas hasheadas, nunca texto plano).
//   - Es idempotente: si el email ya existe, no lo duplica.
//   - Crea (si faltan) un médico con horarios y un paciente con turnos de ejemplo.
//
// Credenciales resultantes:
//   Paciente -> email: paciente@demo.com  | contraseña: Paciente123
//   Médico   -> email: medico@demo.com    | contraseña: Medico123
require('dotenv').config();
const bcrypt = require('bcrypt');
const { sql, poolPromise } = require('../config/db.sqlserver');

const SALT_ROUNDS = 10;

const DEMO_PACIENTE = {
  email: 'paciente@demo.com',
  contrasena: 'Paciente123',
  nombre: 'Carlos',
  apellido: 'Gomez',
  dni: '34567890',
  fechaNacimiento: '1988-04-12',
  telefono: '3704123456',
};

const DEMO_MEDICO = {
  email: 'medico@demo.com',
  contrasena: 'Medico123',
  nombre: 'Franco',
  apellido: 'Alegre',
  matricula: 'MP-12345',
  especialidad: 'Cardiología',
  telefono: '3704654321',
  horarios: [
    { dias: 'Lunes a Viernes', horaInicio: '08:00', horaFin: '12:00' },
    { dias: 'Martes y Jueves', horaInicio: '16:00', horaFin: '20:00' },
  ],
};

/** Busca un usuario por email. */
async function buscarUsuario(email) {
  const res = await new sql.Request(await poolPromise)
    .input('email', sql.NVarChar(150), email)
    .query('SELECT usuario_id, email, rol FROM Usuarios WHERE email = @email');
  return res.recordset[0] || null;
}

/**
 * Crea el usuario (hash bcrypt) y su fila en Pacientes/Medicos.
 * Si el email ya existe se reutiliza el usuario y se asegura la fila hija.
 */
async function crearOActualizar({ email, contrasena, rol }) {
  const pool = await poolPromise;
  let usuario = await buscarUsuario(email);

  if (!usuario) {
    const hash = await bcrypt.hash(contrasena, SALT_ROUNDS);
    const res = await pool
      .request()
      .input('email', sql.NVarChar(150), email)
      .input('hash', sql.NVarChar(200), hash)
      .input('rol', sql.NVarChar(20), rol)
      .query(`INSERT INTO Usuarios (email, contrasena_hash, rol)
              OUTPUT INSERTED.usuario_id, INSERTED.email, INSERTED.rol
              VALUES (@email, @hash, @rol)`);
    usuario = res.recordset[0];
    console.log(`   ✔ Usuario creado (id ${usuario.usuario_id}, rol ${rol})`);
  } else {
    console.log(`   • Usuario ya existente (id ${usuario.usuario_id}), no se modifica la contraseña`);
  }
  return usuario;
}

async function seedPaciente() {
  const pool = await poolPromise;
  console.log(`\n👤 Paciente demo: ${DEMO_PACIENTE.email}`);
  const usuario = await crearOActualizar({ ...DEMO_PACIENTE, rol: 'paciente' });

  const existe = await pool
    .request()
    .input('usuario_id', sql.Int, usuario.usuario_id)
    .query('SELECT paciente_id FROM Pacientes WHERE usuario_id = @usuario_id');

  let pacienteId = existe.recordset[0]?.paciente_id;
  if (!pacienteId) {
    const res = await pool
      .request()
      .input('usuario_id', sql.Int, usuario.usuario_id)
      .input('nombre', sql.NVarChar(100), DEMO_PACIENTE.nombre)
      .input('apellido', sql.NVarChar(100), DEMO_PACIENTE.apellido)
      .input('dni', sql.VarChar(8), DEMO_PACIENTE.dni)
      .input('fecha_nacimiento', sql.Date, DEMO_PACIENTE.fechaNacimiento)
      .input('telefono', sql.NVarChar(20), DEMO_PACIENTE.telefono)
      .query(`INSERT INTO Pacientes (usuario_id, nombre, apellido, dni, fecha_nacimiento, telefono)
              OUTPUT INSERTED.paciente_id
              VALUES (@usuario_id, @nombre, @apellido, @dni, @fecha_nacimiento, @telefono)`);
    pacienteId = res.recordset[0].paciente_id;
    console.log(`   ✔ Ficha de paciente creada (id ${pacienteId})`);
  } else {
    console.log(`   • Ficha de paciente ya existente (id ${pacienteId})`);
  }
  return pacienteId;
}

async function seedMedico() {
  const pool = await poolPromise;
  console.log(`\n🩺 Médico demo: ${DEMO_MEDICO.email}`);
  const usuario = await crearOActualizar({ ...DEMO_MEDICO, rol: 'medico' });

  const existe = await pool
    .request()
    .input('usuario_id', sql.Int, usuario.usuario_id)
    .query('SELECT medico_id FROM Medicos WHERE usuario_id = @usuario_id');

  let medicoId = existe.recordset[0]?.medico_id;
  if (!medicoId) {
    const res = await pool
      .request()
      .input('usuario_id', sql.Int, usuario.usuario_id)
      .input('nombre', sql.NVarChar(100), DEMO_MEDICO.nombre)
      .input('apellido', sql.NVarChar(100), DEMO_MEDICO.apellido)
      .input('matricula', sql.NVarChar(20), DEMO_MEDICO.matricula)
      .input('especialidad', sql.NVarChar(100), DEMO_MEDICO.especialidad)
      .input('telefono', sql.NVarChar(20), DEMO_MEDICO.telefono)
      .query(`INSERT INTO Medicos (usuario_id, nombre, apellido, matricula, especialidad, telefono)
              OUTPUT INSERTED.medico_id
              VALUES (@usuario_id, @nombre, @apellido, @matricula, @especialidad, @telefono)`);
    medicoId = res.recordset[0].medico_id;
    console.log(`   ✔ Ficha de médico creada (id ${medicoId})`);
  } else {
    console.log(`   • Ficha de médico ya existente (id ${medicoId})`);
  }

  const cantHorarios = await pool
    .request()
    .input('medico_id', sql.Int, medicoId)
    .query('SELECT COUNT(*) AS total FROM Horarios WHERE medico_id = @medico_id');

  if (cantHorarios.recordset[0].total === 0) {
    for (const h of DEMO_MEDICO.horarios) {
      await pool
        .request()
        .input('medico_id', sql.Int, medicoId)
        .input('dias', sql.NVarChar(120), h.dias)
        .input('hora_inicio', sql.VarChar(5), h.horaInicio)
        .input('hora_fin', sql.VarChar(5), h.horaFin)
        .query(`INSERT INTO Horarios (medico_id, dias, hora_inicio, hora_fin)
                VALUES (@medico_id, @dias, @hora_inicio, @hora_fin)`);
    }
    console.log(`   ✔ ${DEMO_MEDICO.horarios.length} horarios agregados (visible en la cartilla)`);
  } else {
    console.log(`   • El médico ya tiene ${cantHorarios.recordset[0].total} horarios cargados`);
  }
  return medicoId;
}

/** Turnos de ejemplo: 2 pendientes (hoy/próximo día hábil) + 1 atendido en el pasado. */
async function seedTurnos(pacienteId, medicoId) {
  const pool = await poolPromise;

  const existentes = await pool
    .request()
    .input('paciente_id', sql.Int, pacienteId)
    .query('SELECT COUNT(*) AS total FROM Turnos WHERE paciente_id = @paciente_id');

  if (existentes.recordset[0].total > 0) {
    console.log(`\n📅 El paciente demo ya tiene ${existentes.recordset[0].total} turnos, no se agregan más.`);
    return;
  }

  const turnosDemo = [
    { fecha: 'CAST(GETDATE() AS DATE)', hora: '09:00', estado: 'pendiente', motivo: 'Control anual' },
    { fecha: 'DATEADD(day, 3, CAST(GETDATE() AS DATE))', hora: '09:30', estado: 'pendiente', motivo: 'Consulta general' },
    { fecha: 'DATEADD(day, -7, CAST(GETDATE() AS DATE))', hora: '10:00', estado: 'atendido', motivo: 'Revisión de estudios' },
  ];

  for (const t of turnosDemo) {
    await pool
      .request()
      .input('paciente_id', sql.Int, pacienteId)
      .input('medico_id', sql.Int, medicoId)
      .input('estado', sql.NVarChar(15), t.estado)
      .input('motivo', sql.NVarChar(300), t.motivo)
      .query(`INSERT INTO Turnos (paciente_id, medico_id, fecha, hora, estado, motivo)
              VALUES (@paciente_id, @medico_id, ${t.fecha}, '${t.hora}', @estado, @motivo)`);
  }
  console.log(`\n📅 ${turnosDemo.length} turnos de ejemplo creados.`);
}

(async () => {
  try {
    console.log('🌱 Sembrando datos DEMO en TrabajoTurnos…');
    const pacienteId = await seedPaciente();
    const medicoId = await seedMedico();
    await seedTurnos(pacienteId, medicoId);

    console.log('\n✅ Listo. Credenciales de acceso:');
    console.log('   Paciente → paciente@demo.com / Paciente123');
    console.log('   Médico   → medico@demo.com   / Medico123');
    console.log('   Médico 2 → doctor@demo.com   / Doctor123  (Clínica Médica)');
    await sql.close();
  } catch (err) {
    console.error('\n❌ Error al sembrar datos:', err.message);
    process.exit(1);
  }
})();
