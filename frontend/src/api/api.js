// src/api/api.js — Puente de conexión Frontend <-> Backend (Express + SQL Server)
// Centraliza la URL base y el manejo de errores para todas las peticiones.

// Si VITE_API_URL está definida se usa tal cual; si no, se usa una ruta relativa
// para que funcione detrás del proxy de Vite (dev) o de un rewrite en producción.
// Usar rutas relativas evita errores de CORS y fallos de red ("Failed to fetch").
export const API_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

/** Helper genérico de fetch con JSON y manejo de errores del backend. */
async function peticion(ruta, opciones = {}) {
  let res;
  try {
    res = await fetch(`${API_URL}${ruta}`, {
      // Las cabeceras de opciones van al final para respetar method/body.
      ...opciones,
      headers: { "Content-Type": "application/json", ...(opciones.headers || {}) },
    });
  } catch {
    // Error de red: el backend no está levantado, la URL es incorrecta o CORS lo bloqueó.
    throw new Error(
      `No se pudo conectar con el servidor (${API_URL}). Verificá que el backend esté corriendo.`
    );
  }

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
