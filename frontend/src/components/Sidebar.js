import React from "react";
import {
  IconLayoutDashboard,
  IconPackage,
  IconCategory,
  IconArrowsExchange,
  IconUsers,
  IconFileAnalytics,
  IconLogout,
} from "@tabler/icons-react";
import LogoStockVelia from "../assets/logo_stockvelia.png"
import "../styles/Sidebar.css";

function Sidebar({setSeccion}) {
  return (
    <div className="sidebar">
      <div>
        <div className="sidebar-logo">
            <img src={LogoStockVelia} alt="Logo de StockVelia"></img>
          <h2>StockVelia</h2>
        </div>

        <div className="sidebar-menu">
          <button onClick={() => setSeccion("inicio")}>
            <IconLayoutDashboard size={22} />
            <span>Dashboard</span>
          </button>

          <button onClick={() => setSeccion("productos")}>
            <IconPackage size={22} />
            <span>Productos</span>
          </button>

          <button onClick={() => setSeccion("categorias")}>
            <IconCategory size={22} />
            <span>Categorías</span>
          </button>

          <button onClick={() => setSeccion("movimientos")}>
            <IconArrowsExchange size={22} />
            <span>Movimientos</span>
          </button>

          <button onClick={() => setSeccion("usuarios")}>
            <IconUsers size={22} />
            <span>Usuarios</span>
          </button>

          <button onClick={() => setSeccion("reportes")}>
            <IconFileAnalytics size={22} />
            <span>Reportes</span>
          </button>
        </div>
      </div>

      <div className="sidebar-footer">
        <button>
          <IconLogout size={22} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;