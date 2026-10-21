import React, { useState } from "react";
import "../../../styles/ModalUsuario.css";

function ModalUsuario({ isOpen, onClose, onGuardar }) {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onGuardar({ nombre, correo, password });
    setNombre("");
    setCorreo("");
    setPassword("");
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-fade">
        <div className="modal-header">
          <h3>Nuevo Empleado</h3>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-grupo-input">
            <label>Nombre</label>
            <input
              type="text"
              placeholder="Nombre completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div className="modal-grupo-input">
            <label>Correo electrónico</label>
            <input
              type="email"
              placeholder="empleado@correo.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>

          <div className="modal-grupo-input">
            <label>Contraseña</label>
            <input
              type="password"
              placeholder="Mín. 6 caracteres, mayúscula, minúscula y número"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="modal-botones">
            <button type="button" className="btn-cancelar" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-guardar">
              Crear empleado
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalUsuario;