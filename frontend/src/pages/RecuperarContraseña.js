import React, { useState } from "react";
import { IconMail, IconArrowNarrowLeft } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import ModalCodigo from "../components/ModalCodigo";
import ModalNuevaContraseña from "../components/ModalNuevaContraseña";
import "../styles/RecuperarContraseña.css";

function RecuperarContraseña() {
  const [correo, setCorreo] = useState("");
  const [mostrarCodigo, setMostrarCodigo] = useState(false);
  const [mostrarNuevaContraseña, setMostrarNuevaContraseña] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Enviar codigo a:", correo);

    setMostrarCodigo(true);
  };

  return (
    <div className="contenedor-principal-recuperarContraseña">
      <div className="recuperarContraseña-contenedor">
        <h2>Recuperar contraseña</h2>
        <p>
          Ingresa tu correo electrónico y te enviaremos un enlace para
          restablecer tu contraseña
        </p>

        <form onSubmit={handleSubmit}>
          <div className="input-recuperar-contraseña">
            <IconMail size={25} />
            <input
              type="email"
              placeholder="Correo electrónico"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>

          <div className="boton-recuperar-contraseña">
            <button type="submit">
              <strong>Enviar código</strong>
            </button>
          </div>

          <div className="boton-volver-login">
            <Link to="/" className="enlace-contenedor">
              <IconArrowNarrowLeft size={25} />
              <span>Volver al inicio de sesión</span>
            </Link>
          </div>
        </form>
      </div>
      <ModalCodigo
        abierto={mostrarCodigo}
        alCerrar={() => setMostrarCodigo(false)}
        alVerificar={() => {
          setMostrarCodigo(false);
          setMostrarNuevaContraseña(true);
        }}
      />

      <ModalNuevaContraseña
        abierto={mostrarNuevaContraseña}
        alCerrar={() => setMostrarNuevaContraseña(false)}
      />
    </div>
  );
}

export default RecuperarContraseña;
