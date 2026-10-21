import React from "react";
import { IconUserCircle } from "@tabler/icons-react";
import "../styles/Header.css";

function Header() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  return (
    <header className="header">
      <div className="header-titulo">
        <h2>{usuario?.nombre_empresa || "StockVelia"}</h2>
        <p className="header-subtitulo">Panel de Control General</p>
      </div>

      <div className="header-usuario">
        <div className="datos-usuario">
          <span>{usuario?.nombre || "Usuario"}</span>
          <small>{usuario?.id_rol === 1 ? "Administrador" : "Empleado"}</small>
        </div>

        <div className="avatar">
          {usuario?.nombre ? (
            usuario.nombre.charAt(0).toUpperCase()
          ) : (
            <IconUserCircle size={26} />
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;