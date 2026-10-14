import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Registro from "./paginas/Registro";
import DashboardMedico from "./paginas/DashboardMedico";

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta para el paciente que se registra */}
        <Route path="/" element={<Registro />} />
        <Route path="/registro" element={<Registro />} />

        {/* Ruta exclusiva para la interfaz del médico */}
        <Route path="/medico" element={<DashboardMedico />} />
      </Routes>
    </Router>
  );
}

export default App;
