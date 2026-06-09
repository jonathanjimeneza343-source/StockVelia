import React, { useState } from "react";
import "../styles/Modales.css";

function ModalCodigo({ abierto, alCerrar, alVerificar }) {
  const [codigo, setCodigo] = useState("");

  if (!abierto) return null;

  const verificarCodigo = () => {
    if (codigo.length !== 6) {
      alert("Ingrese un código válido de 6 dígitos");
      return;
    }

    alVerificar(codigo);
  };

  return (
    <div className="fondo-modal">
      <div className="contenedor-modal">
        <div className="cabecera-modal">
          <h3>Verificar código</h3>

          <button
            className="cerrar-modal"
            onClick={alCerrar}
          >
            ×
          </button>
        </div>

        <p>Ingresa el código enviado a tu correo electrónico.</p>

        <input
          type="text"
          placeholder="Código de verificación"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
        />

        <div className="acciones-modal">
          <button onClick={alCerrar}>
            Cancelar
          </button>

          <button onClick={verificarCodigo}>
            Verificar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalCodigo;