import React, { useState } from "react";
import Sidebar from "../components/Sidebar";

import InicioDashboard from "../components/Dashboard/InicioDashboard";
import Productos from "../components/Dashboard/Productos";
import Categorias from "../components/Dashboard/Categorias";
import Movimientos from "../components/Dashboard/Movimientos";
import Usuarios from "../components/Dashboard/Usuarios";
import Reportes from "../components/Dashboard/Reportes";

import "../styles/Dashboard.css";

function Dashboard() {

  const [seccion, setSeccion] = useState("inicio");

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
        return <Usuarios />;
      case "reportes":
        return <Reportes />;
      default:
        return <InicioDashboard />
    }

  };

  return (
    <div className="dashboard">
      <Sidebar setSeccion={setSeccion} />

      <div className="contenido-dashboard">
        {renderSeccion()}
      </div>
    </div>
  );
}

export default Dashboard;