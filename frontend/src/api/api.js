// src/api/api.js — Puente de conexión Frontend <-> Backend (Express + SQL Server)
// Centraliza la URL base y el manejo de errores para todas las peticiones.

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

/** Helper genérico de fetch con JSON y manejo de errores del backend. */
async function peticion(ruta, opciones = {}) {
  const res = await fetch(`${API_URL}${ruta}`, {
    headers: { "Content-Type": "application/json", ...(opciones.headers || {}) },
    ...opciones,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // Respuesta sin cuerpo JSON (ej. 204)
  }

  if (!res.ok) {
    const error = new Error(data?.mensaje || `Error ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

/* ---------------- AUTENTICACIÓN ---------------- */

/** Registro de paciente. Envía el JSON esperado por el controlador SQL Server. */
export function registrarPaciente(payload) {
  return peticion("/auth/registro", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** Login de usuario. */
export function iniciarSesion({ email, password }) {
  return peticion("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

/* ---------------- CARTILLA MÉDICA ---------------- */

/** Lista de médicos activos con sus horarios, con filtros opcionales. */
export function obtenerMedicos({ especialidad, dia, q } = {}) {
  const params = new URLSearchParams();
  if (especialidad && especialidad !== "Todas las especialidades") params.set("especialidad", especialidad);
  if (dia && dia !== "Cualquier día") params.set("dia", dia);
  if (q) params.set("q", q);

  const query = params.toString();
  return peticion(`/medicos${query ? `?${query}` : ""}`);
}

/** Especialidades disponibles en la cartilla. */
export function obtenerEspecialidades() {
  return peticion("/medicos/especialidades");
}
