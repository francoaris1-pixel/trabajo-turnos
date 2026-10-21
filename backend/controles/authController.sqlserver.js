// controles/authController.sqlserver.js — Registro y login (SQL Server)
const jwt = require('jsonwebtoken');
const { crearUsuario, buscarPorEmail, verificarContrasena } = require('../modulos/Usuario.sqlserver');

const JWT_SECRET = process.env.JWT_SECRET; // NO poner la clave en el código

const registrar = async (req, res) => {
  try {
    const { email, contrasena, nombre, apellido, dni, fechaNacimiento, telefono } = req.body;
    if (!email || !contrasena || !nombre || !apellido || !dni || !fechaNacimiento) {
      return res.status(400).json({ mensaje: 'Faltan campos obligatorios.' });
    }
    if (!/^\d{7,8}$/.test(String(dni))) {
      return res.status(400).json({ mensaje: 'El DNI debe tener 7 u 8 dígitos numéricos.' });
    }
    if (contrasena.length < 8) {
      return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 8 caracteres.' });
    }

    const existente = await buscarPorEmail(email);
    if (existente) return res.status(409).json({ mensaje: 'El email ya está registrado.' });

    const usuario = await crearUsuario({
      email,
      contrasena, // se hashea dentro del modelo con bcrypt
      rol: 'paciente',
      datosPaciente: { nombre, apellido, dni, fechaNacimiento, telefono },
    });
    res.status(201).json({ usuario: { usuario_id: usuario.usuario_id, email: usuario.email, rol: usuario.rol } });
  } catch (err) {
    if (err.number === 2601 || err.number === 2627) {
      return res.status(409).json({ mensaje: 'Email o DNI ya registrado.' });
    }
    res.status(500).json({ mensaje: 'Error del servidor al registrar.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ mensaje: 'Email y contraseña requeridos.' });

    const usuario = await buscarPorEmail(email);
    if (!usuario) return res.status(401).json({ mensaje: 'Credenciales inválidas.' });

    const ok = await verificarContrasena(password, usuario.contrasena_hash);
    if (!ok) return res.status(401).json({ mensaje: 'Credenciales inválidas.' });

    const token = jwt.sign(
      { usuario_id: usuario.usuario_id, rol: usuario.rol },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token, usuario: { usuario_id: usuario.usuario_id, email: usuario.email, rol: usuario.rol } });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error del servidor al iniciar sesión.' });
  }
};

module.exports = { registrar, login };
