import React, { useState } from "react";
import { IconMail, IconArrowNarrowLeft } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { solicitarRecuperacion } from "../services/authService";
import ModalCodigo from "../components/ModalCodigo";
import ModalNuevaContraseña from "../components/ModalNuevaContraseña";
import Swal from "sweetalert2";
import "../styles/RecuperarContraseña.css";

function RecuperarContraseña() {
  const [correo, setCorreo] = useState("");
  const [mostrarCodigo, setMostrarCodigo] = useState(false);
  const [mostrarNuevaContraseña, setMostrarNuevaContraseña] = useState(false);
  const [codigoVerificacion, setCodigoVerificacion] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);

    try {
      await solicitarRecuperacion(correo);
      
      Swal.fire({
        icon: "success",
        iconColor: "#5e059e",
        title: "¡Código enviado!",
        text: "Revisa tu bandeja de entrada para continuar.",
        timer: 2000,
        showConfirmButton: false,
      });

      setMostrarCodigo(true);
    } catch (error) {
      const mensajeError =
        error.response?.data?.error || "Error al solicitar la recuperación";
      
      Swal.fire({
        icon: "error",
        iconColor: "#5e059e",
        title: "Oops...",
        text: mensajeError,
        confirmButtonColor: "#5e059e",
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="contenedor-principal-recuperarContraseña">
      <div className="recuperarContraseña-contenedor">
        <h2>Recuperar contraseña</h2>
        <p>
          Ingresa tu correo electrónico y te enviaremos un código para restablecer tu contraseña.
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
              <IconArrowNarrowLeft size={22} />
              <span>Volver al inicio de sesión</span>
            </Link>
          </div>
        </form>
      </div>

      <ModalCodigo
        abierto={mostrarCodigo}
        alCerrar={() => setMostrarCodigo(false)}
        alVerificar={(codigo) => {
          setCodigoVerificacion(codigo);
          setMostrarCodigo(false);
          setMostrarNuevaContraseña(true);
        }}
        correo={correo}
      />

      <ModalNuevaContraseña
        abierto={mostrarNuevaContraseña}
        alCerrar={() => setMostrarNuevaContraseña(false)}
        correo={correo}
        codigo={codigoVerificacion}
      />
    </div>
  );
}

export default RecuperarContraseña;