import React, { useState } from "react";
import "../diseño/MedicoDashboard.css"; // Reutilizamos los estilos premium del dashboard

function DashboardPaciente() {
  const [misTurnos, setMisTurnos] = useState([
    { id: 1, fecha: "15/10/2026", hora: "09:00", medico: "Dr. Franco (Cardiología)", estado: "pendiente" },
    { id: 2, fecha: "22/10/2026", hora: "11:30", medico: "Dr. Franco (Cardiología)", estado: "pendiente" },
    { id: 3, fecha: "01/10/2026", hora: "10:15", medico: "Dra. Martínez (Clínica)", estado: "atendido" },
  ]);

  const handleCancelarTurno = (id) => {
    const confirmar = window.confirm("¿Está seguro de que desea cancelar este turno médico?");
    if (confirmar) {
      setMisTurnos(misTurnos.map((t) => (t.id === id ? { ...t, estado: "cancelado" } : t)));
    }
  };

  const proximos = misTurnos.filter((t) => t.estado === "pendiente").length;
  const completados = misTurnos.filter((t) => t.estado === "atendido").length;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>¡Hola, Carlos Gomez!</h1>
          <p style={{ color: "#64748b" }}>Bienvenido de nuevo a su espacio médico virtual.</p>
        </div>
        <div className="doctor-profile" style={{ background: "#d1fae5", color: "#069669" }}>Paciente Activo</div>
      </header>

      <section className="metrics-grid">
        <div className="metric-card" style={{ borderLeft: "4px solid #0284c7" }}>
          <h3>Mis Turnos Próximos</h3>
          <div className="metric-value" style={{ color: "#0284c7" }}>{proximos}</div>
        </div>
        <div className="metric-card" style={{ borderLeft: "4px solid #10b981" }}>
          <h3>Consultas Completadas</h3>
          <div className="metric-value" style={{ color: "#10b981" }}>{completados}</div>
        </div>
      </section>

      <section className="agenda-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <h2>Historial y Próximos Turnos</h2>
          <button
            className="btn-action btn-atendido"
            style={{ background: "#069669" }}
            onClick={() => alert("Función para solicitar nuevo turno en desarrollo...")}
          >
            + Solicitar Nuevo Turno
          </button>
        </div>

        <div className="table-responsive">
          <table className="turnos-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Médico / Especialidad</th>
                <th>Estado</th>
                <th>Gestión</th>
              </tr>
            </thead>
            <tbody>
              {misTurnos.map((turno) => (
                <tr key={turno.id}>
                  <td>{turno.fecha}</td>
                  <td style={{ fontWeight: "700" }}>{turno.hora} hs</td>
                  <td>{turno.medico}</td>
                  <td>
                    <span className={`status-badge ${turno.estado}`}>{turno.estado}</span>
                  </td>
                  <td>
                    {turno.estado === "pendiente" ? (
                      <button className="btn-action btn-cancelar" onClick={() => handleCancelarTurno(turno.id)}>
                        Cancelar Turno
                      </button>
                    ) : (
                      <span style={{ color: "#94a3b8", fontStyle: "italic", fontSize: "13px" }}>Sin acciones</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default DashboardPaciente;
