import React from "react";
import { Link } from "react-router-dom";
import { Navbar } from "../comoponentes/Navbar";
import heroHospital from "../assets/hero.png";
import "../diseño/HospitalHome.css";

/**
 * Página de bienvenida del Hospital Zonal de Añatuya.
 */
function Home() {
  return (
    <div className="home">
      <Navbar />

      {/* Banner principal */}
      <section className="hero" style={{ backgroundImage: `url(${heroHospital})` }}>
        <div className="hero-overlay" />

        <div className="hero-contenido">
          <span className="hero-badge">
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z"
              />
            </svg>
            Añatuya · Santiago del Estero
          </span>

          <h1 className="hero-titulo">
            Hospital Zonal de <span>Añatuya</span>
          </h1>
          <p className="hero-subtitulo">
            Tu salud, nuestra prioridad. Sacá tu turno online en pocos pasos y
            accedé a la atención médica que necesitás, cuando la necesitás.
          </p>

          {/* Botones rápidos */}
          <div className="hero-acciones">
            <Link to="/turnos" className="btn-pill btn-pill-primario">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M7 2v2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7Zm12 7v10H5V9h14ZM7 11v2h2v-2H7Zm4 0v2h2v-2h-2Zm4 0v2h2v-2h-2Z"
                />
              </svg>
              Solicitar turno
            </Link>

            <Link to="/servicios" className="btn-pill btn-pill-secundario">
              Ver servicios
            </Link>

            <Link to="/mis-turnos" className="btn-pill btn-pill-secundario">
              Mis turnos
            </Link>
          </div>
        </div>
      </section>

      {/* Franja de accesos rápidos */}
      <section className="home-accesos">
        <Link to="/medicos" className="acceso-card">
          <span className="acceso-icono" aria-hidden="true">👨‍⚕️</span>
          <h3>Cartilla médica</h3>
          <p>Conocé a nuestros profesionales y sus horarios de atención.</p>
        </Link>

        <Link to="/turnos" className="acceso-card">
          <span className="acceso-icono" aria-hidden="true">📅</span>
          <h3>Sacar turno</h3>
          <p>Reservá tu consulta online de forma rápida y segura.</p>
        </Link>

        <Link to="/servicios" className="acceso-card">
          <span className="acceso-icono" aria-hidden="true">🏥</span>
          <h3>Servicios</h3>
          <p>Guardia, laboratorio, imagenología y todas nuestras áreas.</p>
        </Link>
      </section>
    </div>
  );
}

export default Home;
