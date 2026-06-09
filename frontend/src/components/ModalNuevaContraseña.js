import React, { useState } from "react";
import { restablecerPassword } from "../services/authService";
import "../styles/Modales.css";

function ModalNuevaContraseña({ abierto, alCerrar, correo, codigo }) {
  const [contraseña, setContraseña] = useState("");
  const [confirmarContraseña, setConfirmarContraseña] = useState("");

  if (!abierto) return null;

  const guardarContraseña = async () => {
    if (contraseña.length < 8) {
      alert("La contraseña debe tener mínimo 8 caracteres");
      return;
    }

    if (contraseña !== confirmarContraseña) {
      alert("Las contraseñas no coinciden");
      return;
    }

    try {
      await restablecerPassword({
        correo,
        codigo,
        nuevaPassword: contraseña,
      });

      alert("Contraseña actualizada correctamente");
      alCerrar();
    } catch (error) {
      alert(error.response?.data?.error || "Error al actualizar la contraseña");
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
