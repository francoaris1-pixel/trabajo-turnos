import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./paginas/Home";
import Medicos from "./paginas/Medicos";
import Registro from "./paginas/Registro";
import DashboardMedico from "./paginas/DashboardMedico";

function App() {
  return (
    <Router>
      <Routes>
        {/* Página de bienvenida */}
        <Route path="/" element={<Home />} />

        {/* Cartilla médica */}
        <Route path="/medicos" element={<Medicos />} />

        {/* Ruta para el paciente que se registra */}
        <Route path="/registro" element={<Registro />} />

        {/* Ruta exclusiva para la interfaz del médico */}
        <Route path="/medico" element={<DashboardMedico />} />
      </Routes>
    </Router>
  );
}

export default App;
