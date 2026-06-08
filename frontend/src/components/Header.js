import React from "react";
import "../styles/Header.css";

function Header() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  return (
    <header className="header">
      <div className="header-titulo">
        <h2>StockVelia</h2>
      </div>

      <div className="header-usuario">
        <div className="avatar">
          {usuario?.nombre?.charAt(0).toUpperCase()}
        </div>

        <div className="datos-usuario">
          <span>{usuario?.nombre}</span>
          <small>
            {usuario?.id_rol === 1 ? "Administrador" : "Empleado"}
          </small>
        </div>
      </div>
    </header>
  );
}

export default Header;