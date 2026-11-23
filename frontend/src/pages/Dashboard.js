import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import InicioDashboard from "../components/Dashboard/InicioDashboard";
import Productos from "../components/Dashboard/Productos";
import Categorias from "../components/Dashboard/Categorias";
import Movimientos from "../components/Dashboard/Movimientos";
import Usuarios from "../components/Dashboard/Usuarios";
import Reportes from "../components/Dashboard/Reportes";
import MiPerfil from "../components/Dashboard/MiPerfil";
import { aplicarColorTemaEmpresa } from "../utils/temaEmpresa";
import "../styles/Dashboard.css";

function obtenerUsuarioInicial() {
  try {
    return JSON.parse(localStorage.getItem("usuario")) || {};
  } catch {
    return {};
  }
}

function Dashboard() {
  const [seccion, setSeccion] = useState("inicio");
  const [usuario, setUsuario] = useState(obtenerUsuarioInicial);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    const usuarioGuardado = obtenerUsuarioInicial();
    setUsuario(usuarioGuardado);
    aplicarColorTemaEmpresa(usuarioGuardado?.color_tema);
  }, [navigate]);

  const esAdmin = usuario?.id_rol === 1 || usuario?.id_rol === 2;

  const renderSeccion = () => {
    switch (seccion) {
      case "inicio":
        return <InicioDashboard />;
      case "productos":
        return <Productos />;
      case "categorias":
        return <Categorias />;
      case "movimientos":
        return <Movimientos />;
      case "usuarios":
        return esAdmin ? <Usuarios /> : <InicioDashboard />;
      case "reportes":
        return esAdmin ? <Reportes /> : <InicioDashboard />;
      case "perfil":
        return <MiPerfil onUsuarioActualizado={setUsuario} />;
      default:
        return <InicioDashboard />;
    }
  };

  return (
    <div className="dashboard">
      <Sidebar seccion={seccion} setSeccion={setSeccion} usuarioProp={usuario} />
      <div className="contenido-dashboard">
        <Header setSeccion={setSeccion} usuarioProp={usuario} />
        {renderSeccion()}
      </div>
    </div>
  );
}

export default Dashboard;