import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { iniciarSesion } from "../api/api";
import "../diseño/Registro.css";

/**
 * Inicio de sesión del Hospital Zonal de Añatuya.
 * Reutiliza los estilos premium de Registro.css (tarjeta esmerilada, stepper, banners).
 */
export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setEnviando(true);

    try {
      const data = await iniciarSesion({ email: email.trim().toLowerCase(), password });

      // Guardamos token + usuario para las rutas protegidas
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));

      // Redirigimos según el rol del usuario autenticado
      navigate(data.usuario.rol === "medico" ? "/medico" : "/paciente");
    } catch (err) {
      setError(err.message || "No se pudo iniciar sesión.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="registro-container login-contenedor">
      <div className="registro-card login-tarjeta">
        {/* Encabezado */}
        <div className="login-encabezado">
          <h2>Sistema de Turnos</h2>
          <p>Hospital Zonal de Añatuya · Ingresá a tu cuenta</p>
        </div>

        <form onSubmit={handleLogin} className="login-formulario" noValidate>
          {error && <div className="registro-error-servidor">⚠️ {error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="tu.correo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="input-con-ojo">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Ingresá tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
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
          </div>

          <button type="submit" className="btn-ingresar" disabled={enviando}>
            {enviando ? "Ingresando…" : "Ingresar"}
          </button>
        </form>

        <div className="login-pie">
          <p>
            ¿No tienes una cuenta?{" "}
            <Link to="/registro">Regístrate aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
