import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login"; // importa tu componente Login
import Register from "./pages/Register";
import RecuperarContraseña from "./pages/RecuperarContraseña";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta principal que carga Login */}
        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/recuperarContraseña" element={<RecuperarContraseña />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
