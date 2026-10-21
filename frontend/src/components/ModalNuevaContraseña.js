import React, { useState } from "react";
import { IconLock } from "@tabler/icons-react";
import { restablecerPassword } from "../services/authService";
import Swal from "sweetalert2";
import "../styles/Modales.css";

function ModalNuevaContraseña({ abierto, alCerrar, correo, codigo }) {
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [cargando, setCargando] = useState(false);

  if (!abierto) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (nuevaPassword !== confirmarPassword) {
      Swal.fire({
        icon: "error",
        iconColor: "#5e059e",
        title: "Oops...",
        text: "Las contraseñas no coinciden",
        confirmButtonColor: "#5e059e",
      });
      return;
    }

    setCargando(true);

    try {
      await restablecerPassword({ correo, codigo, nuevaPassword });

      Swal.fire({
        icon: "success",
        iconColor: "#5e059e",
        title: "¡Contraseña actualizada!",
        text: "Ya puedes iniciar sesión con tu nueva contraseña.",
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        alCerrar();
        window.location.href = "/login";
      });

    } catch (error) {
      const mensaje = error.response?.data?.error || "No se pudo actualizar la contraseña";
      Swal.fire({
        icon: "error",
        iconColor: "#5e059e",
        title: "Error",
        text: mensaje,
        confirmButtonColor: "#5e059e",
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fondo-modal">
      <div className="contenedor-modal">
        <div className="cabecera-modal">
          <h3>Nueva contraseña</h3>
          <button className="cerrar-modal" onClick={alCerrar}>
            ×
          </button>
        </div>

        <p>Ingresa y confirma tu nueva contraseña para finalizar el proceso.</p>

        <form onSubmit={handleSubmit} className="formulario-modal">
          <div className="input-contenedor-modal">
            <IconLock size={22} className="icono-input" />
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={nuevaPassword}
              onChange={(e) => setNuevaPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-contenedor-modal">
            <IconLock size={22} className="icono-input" />
            <input
              type="password"
              placeholder="Confirmar contraseña"
              value={confirmarPassword}
              onChange={(e) => setConfirmarPassword(e.target.value)}
              required
            />
          </div>

          <div className="acciones-modal">
            <button
              type="button"
              className="btn-cancelar"
              onClick={alCerrar}
              disabled={cargando}
            >
              Cancelar
            </button>

            <button type="submit" className="btn-confirmar" disabled={cargando}>
              {cargando ? "Guardando..." : "Actualizar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalNuevaContraseña;