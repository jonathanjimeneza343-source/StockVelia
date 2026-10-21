import React, { useState } from "react";
import { IconKey } from "@tabler/icons-react";
import Swal from "sweetalert2";
import "../styles/Modales.css";

function ModalCodigo({ abierto, alCerrar, alVerificar }) {
  const [codigo, setCodigo] = useState("");

  if (!abierto) return null;

  const verificarCodigo = () => {
    if (codigo.trim().length !== 6) {
      Swal.fire({
        icon: "warning",
        iconColor: "#5e059e",
        title: "Código incompleto",
        text: "Por favor ingresa un código válido de 6 dígitos.",
        confirmButtonColor: "#5e059e",
      });
      return;
    }

    alVerificar(codigo);
  };

  return (
    <div className="fondo-modal">
      <div className="contenedor-modal">
        <div className="cabecera-modal">
          <h3>Verificar código</h3>
          <button className="cerrar-modal" onClick={alCerrar}>
            ×
          </button>
        </div>

        <p>Ingresa el código de verificación de 6 dígitos enviado a tu correo.</p>

        <div className="input-contenedor-modal">
          <IconKey size={22} className="icono-input" />
          <input
            type="text"
            placeholder="Ej: 123456"
            maxLength={6}
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
          />
        </div>

        <div className="acciones-modal">
          <button type="button" className="btn-cancelar" onClick={alCerrar}>
            Cancelar
          </button>
          <button type="button" className="btn-confirmar" onClick={verificarCodigo}>
            Verificar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalCodigo;