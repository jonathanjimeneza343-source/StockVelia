import React, { useState } from "react";
import { restablecerPassword } from "../services/authService";
import Swal from "sweetalert2";
import "../styles/Modales.css";

function ModalNuevaContraseña({ abierto, alCerrar, correo, codigo }) {
  const [contraseña, setContraseña] = useState("");
  const [confirmarContraseña, setConfirmarContraseña] = useState("");

  if (!abierto) return null;

  const guardarContraseña = async () => {
    if (contraseña.length < 8) {
      Swal.fire({
        icon: "warning",
        title: "Contraseña inválida",
        text: "La contraseña debe tener mínimo 8 caracteres",
        confirmButtonText: "Entendido",
      });
      return;
    }

    if (contraseña !== confirmarContraseña) {
      Swal.fire({
        icon: "error",
        title: "Las contraseñas no coinciden",
        text: "Verifica que ambas contraseñas sean iguales.",
        confirmButtonText: "Entendido",
      });
      return;
    }

    try {
      await restablecerPassword({
        correo,
        codigo,
        nuevaPassword: contraseña,
      });

      Swal.fire({
        icon: "success",
        title: "¡Contraseña actualizada!",
        text: "Tu contraseña se actualizó correctamente.",
        confirmButtonText: "Continuar",
      }).then(() => {
        alCerrar();
      });

    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.error ||
          "Error al actualizar la contraseña",
        confirmButtonText: "Entendido",
      });
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

        <input
          type="password"
          placeholder="Nueva contraseña"
          value={contraseña}
          onChange={(e) => setContraseña(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmarContraseña}
          onChange={(e) => setConfirmarContraseña(e.target.value)}
        />

        <div className="acciones-modal">
          <button onClick={alCerrar}>Cancelar</button>

          <button onClick={guardarContraseña}>Guardar</button>
        </div>
      </div>
    </div>
  );
}

export default ModalNuevaContraseña;