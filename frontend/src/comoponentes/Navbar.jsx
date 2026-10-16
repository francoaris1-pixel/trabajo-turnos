import React from "react";
import { Link, NavLink } from "react-router-dom";

/**
 * Navbar institucional del Hospital Zonal de Añatuya.
 * Reutilizable en Home y en la cartilla médica.
 */
export function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-contenedor">
        {/* Identidad institucional */}
        <Link to="/" className="navbar-marca">
          <span className="navbar-logo" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" role="img">
              <path
                fill="currentColor"
                d="M12 2 3 5v6c0 5 3.8 9.7 9 11 5.2-1.3 9-6 9-11V5l-9-3Zm1 6h-2v3H8v2h3v3h2v-3h3v-2h-3V8Z"
              />
            </svg>
          </span>
          <span className="navbar-marca-texto">
            <strong>Hospital Zonal</strong>
            <small>Añatuya</small>
          </span>
        </Link>

        {/* Navegación principal */}
        <nav className="navbar-menu" aria-label="Navegación principal">
          <NavLink to="/" end className="navbar-link">
            Inicio
          </NavLink>
          <NavLink to="/medicos" className="navbar-link">
            Médicos
          </NavLink>
          <NavLink to="/servicios" className="navbar-link">
            Servicios
          </NavLink>
          <NavLink to="/turnos" className="navbar-link">
            Sacar Turno
          </NavLink>
        </nav>

        {/* Acciones de sesión */}
        <div className="navbar-acciones">
          <Link to="/login" className="navbar-btn navbar-btn-fantasma">
            Ingresar
          </Link>
          <Link to="/registro" className="navbar-btn navbar-btn-primario">
            Registrarme
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
