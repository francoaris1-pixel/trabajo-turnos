import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "../comoponentes/Navbar";
import { obtenerMedicos } from "../api/api";
import "../diseño/HospitalHome.css";

/**
 * Cartilla médica del Hospital Zonal de Añatuya.
 * Carga los profesionales y sus horarios desde la base de datos (GET /api/medicos).
 */

const DIAS = [
  "Cualquier día",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábados",
];

/** Toma el nombre y arma las iniciales para el círculo azul (ej. "Dr. Ariel Acosta" -> "AA"). */
function inicialesDe(nombreCompleto = "") {
  return nombreCompleto
    .replace(/^(Dr|Dra|Lic|Enf)\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");
}

function Medicos() {
  const [medicos, setMedicos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [especialidad, setEspecialidad] = useState("Todas las especialidades");
  const [dia, setDia] = useState("Cualquier día");

  // Carga dinámica desde el backend cada vez que cambian los filtros.
  useEffect(() => {
    let activo = true;
    setCargando(true);
    setError(null);

    obtenerMedicos({ especialidad, dia, q: busqueda.trim() })
      .then((data) => {
        if (activo) setMedicos(data.medicos || []);
      })
      .catch((err) => {
        if (activo) setError(err.message || "No se pudo cargar la cartilla médica.");
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [especialidad, dia, busqueda]);

  // Especialidades disponibles a partir de los médicos ya cargados.
  const especialidades = useMemo(() => {
    const set = new Set(medicos.map((m) => m.especialidad).filter(Boolean));
    return ["Todas las especialidades", ...set];
  }, [medicos]);

  return (
    <div className="medicos-pagina">
      <Navbar />

      {/* Encabezado */}
      <section className="medicos-encabezado">
        <h1>Cartilla médica</h1>
        <p>Encontrá a tu profesional y solicitá tu turno en segundos.</p>
      </section>

      {/* Buscador y filtros */}
      <section className="medicos-filtros">
        <div className="buscador">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              fill="currentColor"
              d="M10 2a8 8 0 1 0 4.9 14.3l4.4 4.4 1.4-1.4-4.4-4.4A8 8 0 0 0 10 2Zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12Z"
            />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre o especialidad..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <select
          className="selector"
          value={especialidad}
          onChange={(e) => setEspecialidad(e.target.value)}
        >
          {especialidades.map((esp) => (
            <option key={esp} value={esp}>
              {esp}
            </option>
          ))}
        </select>

        <select className="selector" value={dia} onChange={(e) => setDia(e.target.value)}>
          {DIAS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </section>

      {/* Estado: cargando / error */}
      {cargando && <p className="medicos-estado">Cargando cartilla médica…</p>}
      {error && <p className="medicos-error">⚠️ {error}</p>}

      {/* Grilla de profesionales */}
      {!cargando && !error && (
        <section className="medicos-grilla">
          {medicos.length === 0 ? (
            <p className="medicos-vacio">No se encontraron profesionales con esos criterios.</p>
          ) : (
            medicos.map((medico) => (
              <article className="medico-card" key={medico.id ?? medico.medicoId}>
                <div className="medico-card-cabecera">
                  <span className="medico-avatar">{inicialesDe(medico.nombre)}</span>
                  <div className="medico-card-datos">
                    <h3>{medico.nombre}</h3>
                    <span className="medico-especialidad">{medico.especialidad}</span>
                  </div>
                </div>

                {medico.descripcion && (
                  <p className="medico-descripcion">{medico.descripcion}</p>
                )}

                <ul className="medico-horarios">
                  {(medico.horarios || []).map((h, i) => (
                    <li key={i}>
                      <span className="horario-dia">{h.dias}</span>
                      <span className="horario-rango">{h.rango}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/turnos" className="medico-btn-turno">
                  Sacar turno
                </Link>
              </article>
            ))
          )}
        </section>
      )}
    </div>
  );
}

export default Medicos;
