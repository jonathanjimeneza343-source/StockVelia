import React, { useState } from "react";
import {
  IconLayoutDashboard,
  IconPackage,
  IconCategory,
  IconArrowsExchange,
  IconUsers,
  IconFileAnalytics,
  IconUser,
  IconLogout,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/authService";
import Swal from "sweetalert2";
import LogoStockVelia from "../assets/logo_stockvelia.png";
import "../styles/Sidebar.css";

function obtenerUsuario() {
  try {
    return JSON.parse(localStorage.getItem("usuario"));
  } catch {
    return null;
  }
}

function Sidebar({ seccion, setSeccion, usuarioProp }) {
  const [colapsada, setColapsada] = useState(false);
  const usuario = usuarioProp || obtenerUsuario();
  const puedeGestionarAdmin = usuario?.id_rol === 1 || usuario?.id_rol === 2;
  const navigate = useNavigate();

  const handleLogout = async () => {
    const resultado = await Swal.fire({
      title: "¿Cerrar sesión?",
      text: "¿Estás seguro de que deseas salir del sistema?",
      icon: "warning",
      iconColor: "#5e059e",
      showCancelButton: true,
      confirmButtonColor: "#5e059e",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (!resultado.isConfirmed) return;

    try {
      await logout();
      localStorage.removeItem("usuario");
      navigate("/", {
        state: { mensajeCierre: "Sesión cerrada con éxito. Token revocado." },
      });
    } catch (error) {
      console.error("Error al cerrar sesión de forma limpia:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      navigate("/", { state: { mensajeCierre: "Sesión cerrada con éxito." } });
    }
  };

  return (
    <div className={`sidebar ${colapsada ? "colapsada" : ""}`}>
      <div>
        <div className="sidebar-header-wrapper">
          <div className="sidebar-logo">
            <img src={LogoStockVelia} alt="Logo de StockVelia" />
            {!colapsada && <h2>StockVelia</h2>}
          </div>
          <button
            type="button"
            className="btn-toggle-sidebar"
            onClick={() => setColapsada(!colapsada)}
            title={colapsada ? "Expandir barra lateral" : "Minimizar barra lateral"}
          >
            {colapsada ? <IconChevronRight size={18} /> : <IconChevronLeft size={18} />}
          </button>
        </div>

        <div className="sidebar-menu">
          <button
            type="button"
            className={seccion === "inicio" ? "activo" : ""}
            onClick={() => setSeccion("inicio")}
            title={colapsada ? "Dashboard" : ""}
          >
            <IconLayoutDashboard size={22} className="sidebar-icon" />
            {!colapsada && <span>Dashboard</span>}
          </button>
          <button
            type="button"
            className={seccion === "productos" ? "activo" : ""}
            onClick={() => setSeccion("productos")}
            title={colapsada ? "Productos" : ""}
          >
            <IconPackage size={22} className="sidebar-icon" />
            {!colapsada && <span>Productos</span>}
          </button>
          <button
            type="button"
            className={seccion === "categorias" ? "activo" : ""}
            onClick={() => setSeccion("categorias")}
            title={colapsada ? "Categorías" : ""}
          >
            <IconCategory size={22} className="sidebar-icon" />
            {!colapsada && <span>Categorías</span>}
          </button>
          <button
            type="button"
            className={seccion === "movimientos" ? "activo" : ""}
            onClick={() => setSeccion("movimientos")}
            title={colapsada ? "Movimientos" : ""}
          >
            <IconArrowsExchange size={22} className="sidebar-icon" />
            {!colapsada && <span>Movimientos</span>}
          </button>
          {puedeGestionarAdmin && (
            <button
              type="button"
              className={seccion === "usuarios" ? "activo" : ""}
              onClick={() => setSeccion("usuarios")}
              title={colapsada ? "Usuarios" : ""}
            >
              <IconUsers size={22} className="sidebar-icon" />
              {!colapsada && <span>Usuarios</span>}
            </button>
          )}
          {puedeGestionarAdmin && (
            <button
              type="button"
              className={seccion === "reportes" ? "activo" : ""}
              onClick={() => setSeccion("reportes")}
              title={colapsada ? "Reportes" : ""}
            >
              <IconFileAnalytics size={22} className="sidebar-icon" />
              {!colapsada && <span>Reportes</span>}
            </button>
          )}
          <button
            type="button"
            className={seccion === "perfil" ? "activo" : ""}
            onClick={() => setSeccion("perfil")}
            title={colapsada ? "Mi Perfil" : ""}
          >
            <IconUser size={22} className="sidebar-icon" />
            {!colapsada && <span>Mi Perfil</span>}
          </button>
        </div>
      </div>

      <div className="sidebar-footer">
        <button
          type="button"
          onClick={handleLogout}
          title={colapsada ? "Cerrar sesión" : ""}
        >
          <IconLogout size={22} className="sidebar-icon" />
          {!colapsada && <span>Cerrar sesión</span>}
        </button>
      </div>
    </div>
  );
}

export default Sidebar;