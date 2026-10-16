import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registrarPaciente } from "../api/api";
import "../diseño/Registro.css";

const PASOS = [
  { numero: 1, titulo: "Datos personales" },
  { numero: 2, titulo: "Contacto" },
  { numero: 3, titulo: "Cuenta y seguridad" },
];

const INICIAL = {
  nombre: "",
  apellido: "",
  dni: "",
  fechaNacimiento: "",
  telefono: "",
  email: "",
  contrasena: "",
  confirmarContrasena: "",
};

export function Registro() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(INICIAL);
  const [pasoActual, setPasoActual] = useState(0);
  const [errores, setErrores] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(null);
  const [errorServidor, setErrorServidor] = useState(null);

  const cambiarCampo = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrores((prev) => ({ ...prev, [name]: undefined }));
  };

  const validarPasoActual = (indice, datos) => {
    const errs = {};
    if (indice === 0) {
      if (!datos.nombre.trim()) errs.nombre = "Ingresá tu nombre.";
      if (!datos.apellido.trim()) errs.apellido = "Ingresá tu apellido.";
      if (datos.dni && /\D/.test(datos.dni)) {
        errs.dni = "El DNI solo admite números.";
      } else if (!/^\d{7,8}$/.test(datos.dni)) {
        errs.dni = "El DNI debe tener 7 u 8 dígitos.";
      }
      if (!datos.fechaNacimiento) errs.fechaNacimiento = "Seleccioná tu fecha de nacimiento.";
    }
    if (indice === 1) {
      if (!/^\+?[\d\s()-]{7,15}$/.test(datos.telefono)) errs.telefono = "Ingresá un teléfono válido.";
      if (!datos.email) {
        errs.email = "Ingresá tu email.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) {
        errs.email = "El formato del email no es válido.";
      }
    }
    if (indice === 2) {
      if (datos.contrasena.length < 8) errs.contrasena = "Mínimo 8 caracteres.";
      if (datos.confirmarContrasena !== datos.contrasena) errs.confirmarContrasena = "Las contraseñas no coinciden.";
    }
    return errs;
  };

  const erroresPaso = validarPasoActual(pasoActual, formData);
  const pasoValido = Object.keys(erroresPaso).length === 0;

  const siguiente = () => setPasoActual((p) => Math.min(p + 1, PASOS.length - 1));

  const anterior = () => setPasoActual((p) => Math.max(p - 1, 0));

  const irAPaso = (indice) => {
    if (indice < pasoActual) setPasoActual(indice);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validarPasoActual(pasoActual, formData);
    if (Object.keys(errs).length > 0) {
      setErrores(errs);
      return;
    }

    setEnviando(true);
    setErrorServidor(null);
    setMensajeExito(null);

    try {
      // JSON que espera el controlador del backend (SQL Server)
      const payload = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.contrasena,        // alias
        contrasena: formData.contrasena,      // nombre esperado por el controlador
        dni: formData.dni,
        fechaNacimiento: formData.fechaNacimiento,
        telefono: formData.telefono,
      };

      await registrarPaciente(payload);
      setMensajeExito("¡Cuenta creada con éxito! Ya podés iniciar sesión.");
      setFormData(INICIAL);
      setPasoActual(0);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setErrorServidor(err.message || "No se pudo completar el registro.");
    } finally {
      setEnviando(false);
    }
  };

  // Error visible: ya sea por envío o en tiempo real mientras escribe
  const errorVisible = (campo) => errores[campo] || (formData[campo] && erroresPaso[campo]);

  return (
    <div className="registro-container">
      <div className="registro-card">
        {/* --- STEPPER --- */}
        <div className="stepper-header">
          {PASOS.map((paso, i) => (
            <div
              key={paso.numero}
              className={`step-item ${i === pasoActual ? "active" : ""} ${i < pasoActual ? "completed" : ""}`}
              onClick={() => irAPaso(i)}
              role="button"
              tabIndex={i < pasoActual ? 0 : -1}
            >
              <div className="step-number">{i < pasoActual ? "✓" : paso.numero}</div>
              <div className="step-label">{paso.titulo}</div>
            </div>
          ))}
        </div>

        {/* --- FORMULARIO --- */}
        <form onSubmit={handleSubmit} className="registro-content" noValidate>
          <h2>{PASOS[pasoActual].titulo}</h2>

          {pasoActual === 0 && (
            <div className="form-grid">
              <div className="form-fila dos-col">
                <div className="form-group">
                  <label htmlFor="nombre">Nombre</label>
                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    placeholder="Juan"
                    value={formData.nombre}
                    onChange={cambiarCampo}
                    className={errorVisible("nombre") ? "input-error" : ""}
                  />
                  {errorVisible("nombre") && <span className="error-texto">{errorVisible("nombre")}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="apellido">Apellido</label>
                  <input
                    id="apellido"
                    name="apellido"
                    type="text"
                    placeholder="Pérez"
                    value={formData.apellido}
                    onChange={cambiarCampo}
                    className={errorVisible("apellido") ? "input-error" : ""}
                  />
                  {errorVisible("apellido") && <span className="error-texto">{errorVisible("apellido")}</span>}
                </div>
              </div>
              <div className="form-fila dos-col">
                <div className="form-group">
                  <label htmlFor="dni">DNI</label>
                  <input
                    id="dni"
                    name="dni"
                    type="text"
                    inputMode="numeric"
                    placeholder="40123456"
                    value={formData.dni}
                    onChange={cambiarCampo}
                    className={errorVisible("dni") ? "input-error" : ""}
                  />
                  {errorVisible("dni") && <span className="error-texto">{errorVisible("dni")}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="fechaNacimiento">Fecha de nacimiento</label>
                  <input
                    id="fechaNacimiento"
                    name="fechaNacimiento"
                    type="date"
                    value={formData.fechaNacimiento}
                    onChange={cambiarCampo}
                    className={errorVisible("fechaNacimiento") ? "input-error" : ""}
                  />
                  {errorVisible("fechaNacimiento") && <span className="error-texto">{errorVisible("fechaNacimiento")}</span>}
                </div>
              </div>
            </div>
          )}

          {pasoActual === 1 && (
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="telefono">Teléfono</label>
                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  placeholder="+54 9 11 5555-5555"
                  value={formData.telefono}
                  onChange={cambiarCampo}
                  className={errorVisible("telefono") ? "input-error" : ""}
                />
                {errorVisible("telefono") && <span className="error-texto">{errorVisible("telefono")}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="juan.perez@email.com"
                  value={formData.email}
                  onChange={cambiarCampo}
                  className={errorVisible("email") ? "input-error" : ""}
                />
                {errorVisible("email") && <span className="error-texto">{errorVisible("email")}</span>}
              </div>
              <div className="login-alert-banner">
                <span>ℹ️</span>
                <span>Usaremos este email para enviarte confirmaciones de turnos.</span>
              </div>
            </div>
          )}

          {pasoActual === 2 && (
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="contrasena">Contraseña</label>
                <div className="input-con-ojo">
                  <input
                    id="contrasena"
                    name="contrasena"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    value={formData.contrasena}
                    onChange={cambiarCampo}
                    className={errorVisible("contrasena") ? "input-error" : ""}
                  />
                  <button
                    type="button"
                    className="btn-ojo"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                {errorVisible("contrasena") && <span className="error-texto">{errorVisible("contrasena")}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="confirmarContrasena">Confirmar contraseña</label>
                <div className="input-con-ojo">
                  <input
                    id="confirmarContrasena"
                    name="confirmarContrasena"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repetí tu contraseña"
                    value={formData.confirmarContrasena}
                    onChange={cambiarCampo}
                    className={errorVisible("confirmarContrasena") ? "input-error" : ""}
                  />
                  <button
                    type="button"
                    className="btn-ojo"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    title={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showConfirmPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                {errorVisible("confirmarContrasena") && <span className="error-texto">{errorVisible("confirmarContrasena")}</span>}
              </div>
            </div>
          )}

          {/* --- ACCIONES --- */}
          {errorServidor && <div className="registro-error-servidor">⚠️ {errorServidor}</div>}
          {mensajeExito && <div className="registro-exito">✅ {mensajeExito}</div>}

          <div className="stepper-actions">
            <button type="button" className="btn-nav" onClick={anterior} disabled={pasoActual === 0 || enviando}>
              ← Anterior
            </button>
            {pasoActual < PASOS.length - 1 ? (
              <button
                type="button"
                className={`btn-nav btn-next ${pasoValido ? "ready" : ""}`}
                onClick={siguiente}
                disabled={!pasoValido}
              >
                Siguiente →
              </button>
            ) : (
              <button
                type="submit"
                className={`btn-nav btn-next ${pasoValido ? "ready" : ""}`}
                disabled={!pasoValido || enviando}
              >
                {enviando ? "Creando cuenta…" : "Crear cuenta"}
              </button>
            )}
          </div>
        </form>

        <div className="registro-pie">
          <p>¿Ya tienes una cuenta? <a href="/login">Inicia sesión</a></p>
        </div>
      </div>
    </div>
  );
} 

export default Registro;
