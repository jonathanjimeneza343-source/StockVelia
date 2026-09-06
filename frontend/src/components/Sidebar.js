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
import { useNavigate } from "react-router-dom";
import { logout } from "../services/authService";
import Swal from "sweetalert2";
import LogoStockVelia from "../assets/logo_stockvelia.png";
import "../styles/Sidebar.css";

function Sidebar({ seccion, setSeccion }) {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const esAdmin = usuario?.id_rol === 1;

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
      navigate("/", {
        state: { mensajeCierre: "Sesión cerrada con éxito. Token revocado." },
      });
    } catch (error) {
      console.error("Error al cerrar sesión de forma limpia:", error);
      localStorage.removeItem("token");
      navigate("/", { state: { mensajeCierre: "Sesión cerrada con éxito." } });
    }
  };

  return (
    <div className="sidebar">
      <div>
        <div className="sidebar-logo">
          <img src={LogoStockVelia} alt="Logo de StockVelia" />
          <h2>StockVelia</h2>
        </div>

        <div className="sidebar-menu">
          <button
            className={seccion === "inicio" ? "activo" : ""}
            onClick={() => setSeccion("inicio")}
          >
            <IconLayoutDashboard size={22} />
            <span>Dashboard</span>
          </button>

          <button
            className={seccion === "productos" ? "activo" : ""}
            onClick={() => setSeccion("productos")}
          >
            <IconPackage size={22} />
            <span>Productos</span>
          </button>

          <button
            className={seccion === "categorias" ? "activo" : ""}
            onClick={() => setSeccion("categorias")}
          >
            <IconCategory size={22} />
            <span>Categorías</span>
          </button>

          <button
            className={seccion === "movimientos" ? "activo" : ""}
            onClick={() => setSeccion("movimientos")}
          >
            <IconArrowsExchange size={22} />
            <span>Movimientos</span>
          </button>

          {esAdmin && (
            <button
              className={seccion === "usuarios" ? "activo" : ""}
              onClick={() => setSeccion("usuarios")}
            >
              <IconUsers size={22} />
              <span>Usuarios</span>
            </button>
          )}

          {esAdmin && (
            <button
              className={seccion === "reportes" ? "activo" : ""}
              onClick={() => setSeccion("reportes")}
            >
              <IconFileAnalytics size={22} />
              <span>Reportes</span>
            </button>
          )}
        </div>
      </div>

      <div className="sidebar-footer">
        <button onClick={handleLogout}>
          <IconLogout size={22} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;