import React, { useState } from "react";
import "../diseño/MedicoDashboard.css";

function DashboardMedico() {
  const [turnos, setTurnos] = useState([
    { id: 1, hora: "09:00", paciente: "Carlos Gomez", dni: "34.567.890", motivo: "Control Anual", estado: "pendiente" },
    { id: 2, hora: "09:30", paciente: "Ana Milone", dni: "28.123.456", motivo: "Consulta General", estado: "pendiente" },
    { id: 3, hora: "10:15", paciente: "Marcos Lopez", dni: "40.890.123", motivo: "Revisión de Estudios", estado: "atendido" },
    { id: 4, hora: "11:00", paciente: "Lucia Fernandez", dni: "37.456.112", motivo: "Primera Consulta", estado: "pendiente" },
  ]);

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [fechaAgenda, setFechaAgenda] = useState(new Date().toISOString().slice(0, 10));
  const [turnoACancelar, setTurnoACancelar] = useState(null);

  const handleCambiarEstado = (id, nuevoEstado) => {
    setTurnos(turnos.map((turno) => (turno.id === id ? { ...turno, estado: nuevoEstado } : turno)));
    setTurnoACancelar(null);
  };

  const totalTurnos = turnos.length;
  const atendidos = turnos.filter((t) => t.estado === "atendido").length;
  const pendientes = turnos.filter((t) => t.estado === "pendiente").length;

  const turnosFiltrados = turnos
    .filter((t) => (filtroEstado === "todos" ? true : t.estado === filtroEstado))
    .filter((t) => {
      const q = busqueda.trim().toLowerCase();
      if (!q) return true;
      return (
        t.paciente.toLowerCase().includes(q) ||
        t.dni.replace(/\./g, "").includes(q.replace(/\./g, ""))
      );
    });

  const FILTROS = [
    { key: "todos", label: "Todos" },
    { key: "pendiente", label: "Pendientes" },
    { key: "atendido", label: "Atendidos" },
    { key: "cancelado", label: "Cancelados" },
  ];

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Panel de Control Médico</h1>
          <p style={{ color: "#64748b" }}>Gestión de turnos y agenda diaria.</p>
        </div>
        <div className="header-right">
          <div className="fecha-selector">
            <label htmlFor="fechaAgenda">Agenda del día</label>
            <input
              id="fechaAgenda"
              type="date"
              value={fechaAgenda}
              onChange={(e) => setFechaAgenda(e.target.value)}
            />
          </div>
          <div className="doctor-profile">Dr. Franco (Cardiología)</div>
        </div>
      </header>

      <section className="metrics-grid">
        <div className="metric-card">
          <h3>Total Turnos Hoy</h3>
          <div className="metric-value">{totalTurnos}</div>
        </div>
        <div className="metric-card" style={{ borderLeft: "4px solid #10b981" }}>
          <h3>Atendidos</h3>
          <div className="metric-value" style={{ color: "#10b981" }}>{atendidos}</div>
        </div>
        <div className="metric-card" style={{ borderLeft: "4px solid #f59e0b" }}>
          <h3>Pacientes en Espera</h3>
          <div className="metric-value" style={{ color: "#f59e0b" }}>{pendientes}</div>
        </div>
      </section>

      <section className="agenda-section">
        <div className="agenda-topbar">
          <h2>Turnos Programados</h2>
          <div className="agenda-controls">
            <input
              className="buscador-turnos"
              type="text"
              placeholder="🔍 Buscar por nombre o DNI..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <div className="filtros-botones">
              {FILTROS.map((f) => (
                <button
                  key={f.key}
                  className={`filtro-btn ${filtroEstado === f.key ? "activo" : ""}`}
                  onClick={() => setFiltroEstado(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="turnos-table">
            <thead>
              <tr>
                <th>Hora</th>
                <th>Paciente</th>
                <th>DNI</th>
                <th>Motivo de Consulta</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {turnosFiltrados.length > 0 ? (
                turnosFiltrados.map((turno) => (
                <tr key={turno.id}>
                  <td style={{ fontWeight: "700" }}>{turno.hora} hs</td>
                  <td>{turno.paciente}</td>
                  <td>{turno.dni}</td>
                  <td>{turno.motivo}</td>
                  <td>
                    <span className={`status-badge ${turno.estado}`}>{turno.estado}</span>
                  </td>
                  <td className="actions-cell">
                    {turno.estado === "pendiente" && (
                      <>
                        <button className="btn-action btn-atendido" onClick={() => handleCambiarEstado(turno.id, "atendido")}>
                          Marcar Atendido
                        </button>
                        <button className="btn-action btn-cancelar" onClick={() => setTurnoACancelar(turno)}>
                          Cancelar
                        </button>
                      </>
                    )}
                    {turno.estado !== "pendiente" && (
                      <span style={{ fontSize: "13px", color: "#94a3b8", fontStyle: "italic" }}>Sin acciones</span>
                    )}
                  </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", padding: "32px", color: "#94a3b8" }}>
                        No se encontraron turnos con esos criterios.
                      </td>
                    </tr>
                  )}
                </tbody>
          </table>
        </div>
      </section>

      {turnoACancelar && (
        <div className="modal-overlay" onClick={() => setTurnoACancelar(null)}>
          <div className="modal-caja" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icono">⚠️</div>
            <h3>Confirmar cancelación</h3>
            <p>
              ¿Está seguro de que desea cancelar el turno de{" "}
              <strong>{turnoACancelar.paciente}</strong>?
            </p>
            <div className="modal-acciones">
              <button className="btn-action btn-volver" onClick={() => setTurnoACancelar(null)}>
                Volver
              </button>
              <button
                className="btn-action btn-confirmar"
                onClick={() => handleCambiarEstado(turnoACancelar.id, "cancelado")}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardMedico;
