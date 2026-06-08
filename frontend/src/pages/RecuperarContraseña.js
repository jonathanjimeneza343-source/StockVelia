import React, { useState } from "react";
import { IconMail, IconArrowNarrowLeft } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { solicitarRecuperacion } from "../services/authService";
import ModalCodigo from "../components/ModalCodigo";
import ModalNuevaContraseña from "../components/ModalNuevaContraseña";
import "../styles/RecuperarContraseña.css";

function RecuperarContraseña() {
  const [correo, setCorreo] = useState("");
  const [mostrarCodigo, setMostrarCodigo] = useState(false);
  const [mostrarNuevaContraseña, setMostrarNuevaContraseña] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setCargando(true);

    try {
      await solicitarRecuperacion(correo);
      setMostrarCodigo(true);
    } catch (error) {
      const mensajeError = error.response?.data?.error || "Error al solicitar la recuperación";
      setErrorMsg(mensajeError);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="contenedor-principal-recuperarContraseña">
      <div className="recuperarContraseña-contenedor">
        <h2>Recuperar contraseña</h2>
        <p>
          Ingresa tu correo electrónico y te enviaremos un enlace para
          restablecer tu contraseña
        </p>

        {errorMsg && (
          <div className="alerta-error-recuperar" style={{ color: 'red', marginBottom: '15px', textAlign: 'center' }}>
            <strong>{errorMsg}</strong>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-recuperar-contraseña">
            <IconMail size={25} />
            <input
              type="email"
              placeholder="Correo electrónico"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              disabled={cargando}
            />
          </div>

          <div className="boton-recuperar-contraseña">
            <button type="submit" disabled={cargando}>
              <strong>{cargando ? "Enviando..." : "Enviar código"}</strong>
            </button>
          </div>

          <div className="boton-volver-login">
            <Link to="/login" className="enlace-contenedor">
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
        correo={correo}
      />

      <ModalNuevaContraseña
        abierto={mostrarNuevaContraseña}
        alCerrar={() => setMostrarNuevaContraseña(false)}
        correo={correo}
      />
    </div>
  );
}

export default RecuperarContraseña;
