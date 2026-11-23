import React, { useState, useEffect } from "react";
import "../../../styles/ModalUsuario.css";

function ModalUsuario({
  isOpen,
  onClose,
  onGuardar,
  usuarioAEditar,
  esPropietario,
}) {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [idRol, setIdRol] = useState("3");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (usuarioAEditar) {
        setNombre(usuarioAEditar.nombre || "");
        setCorreo(usuarioAEditar.correo || "");
        setTelefono(usuarioAEditar.telefono || "");
        setIdRol(String(usuarioAEditar.id_rol || 3));
        setPassword("");
      } else {
        setNombre("");
        setCorreo("");
        setTelefono("");
        setIdRol("3");
        setPassword("");
      }
    }
  }, [isOpen, usuarioAEditar]);

  if (!isOpen) return null;

  const esEdicion = Boolean(usuarioAEditar);
  const estaInactivo = esEdicion && usuarioAEditar.estado === false;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (estaInactivo) return;

    onGuardar({
      nombre: nombre.trim(),
      correo: correo.trim().toLowerCase(),
      telefono: telefono.trim(),
      id_rol: esPropietario ? Number(idRol) : 3,
      password,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-fade">
        <div className="modal-header">
          <h3>{esEdicion ? "Editar Usuario" : "Nuevo Usuario"}</h3>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {estaInactivo && (
          <div
            style={{
              backgroundColor: "#fef2f2",
              color: "#991b1b",
              padding: "10px 12px",
              borderRadius: "8px",
              fontSize: "0.85rem",
              marginBottom: "12px",
            }}
          >
            Este usuario se encuentra <strong>Inactivo</strong>. Actívalo
            primero para poder editar sus datos.
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-grupo-input">
            <label>Nombre completo</label>
            <input
              type="text"
              placeholder="Nombre completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              disabled={estaInactivo}
              required
            />
          </div>

          <div className="modal-grupo-input">
            <label>Correo electrónico</label>
            <input
              type="email"
              placeholder="usuario@correo.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              disabled={estaInactivo}
              required
            />
          </div>

          <div className="modal-grupo-input">
            <label>Teléfono (Opcional)</label>
            <input
              type="text"
              placeholder="Ej. +57 300 123 4567"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              disabled={estaInactivo}
            />
          </div>

          <div className="modal-grupo-input">
            <label>Rol asignado</label>
            <select
              value={idRol}
              onChange={(e) => setIdRol(e.target.value)}
              disabled={!esPropietario || estaInactivo}
            >
              <option value="3">Empleado</option>
              {esPropietario && (
                <option value="2">Administrador Operativo</option>
              )}
            </select>
            {!esPropietario && (
              <small style={{ color: "#6b7280", fontSize: "0.78rem" }}>
                Solo el Propietario puede asignar o cambiar roles.
              </small>
            )}
          </div>

          {!esEdicion && (
            <div className="modal-grupo-input">
              <label>Contraseña inicial</label>
              <input
                type="password"
                placeholder="Mín. 6 caracteres, mayúscula, minúscula y número"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          )}

          <div className="modal-botones">
            <button type="button" className="btn-cancelar" onClick={onClose}>
              Cancelar
            </button>
            {!estaInactivo && (
              <button type="submit" className="btn-guardar">
                {esEdicion ? "Guardar cambios" : "Crear usuario"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalUsuario;