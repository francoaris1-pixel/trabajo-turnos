import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./paginas/Home";
import Medicos from "./paginas/Medicos";
import Registro from "./paginas/Registro";
import Login from "./paginas/Login";
import DashboardMedico from "./paginas/DashboardMedico";
import DashboardPaciente from "./paginas/DashboardPaciente";

function App() {
  return (
    <Router>
      <Routes>
        {/* Bienvenida: "/" y "/home" muestran el Home */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />

        {/* Cartilla médica */}
        <Route path="/medicos" element={<Medicos />} />

        {/* Registro de paciente */}
        <Route path="/registro" element={<Registro />} />

        {/* Inicio de sesión */}
        <Route path="/login" element={<Login />} />

        {/* Panel del médico */}
        <Route path="/medico" element={<DashboardMedico />} />

        {/* Panel del paciente */}
        <Route path="/paciente" element={<DashboardPaciente />} />

        {/* Cualquier ruta desconocida vuelve al inicio */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
