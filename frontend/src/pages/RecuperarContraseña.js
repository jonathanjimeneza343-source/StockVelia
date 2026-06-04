import React, { useState } from "react";
import { IconMail, IconArrowNarrowLeft } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import "../styles/RecuperarContraseña.css";

function RecuperarContraseña() {
  const [correo, setCorreo] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Enviar codigo a:", correo);

    //Llamar Api
    //enviar codigo
  };

  return (
    <div className="contenedor-principal-recuperarContraseña">
      <div className="recuperarContraseña-contenedor">
        <h2>Recuperar contraseña</h2>
        <p>
          Ingresa tu correo electrónico y te enviaremos un enlace para<br></br>
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
              <strong>Enviar enlace</strong>
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
    </div>
  );
}

export default RecuperarContraseña;
