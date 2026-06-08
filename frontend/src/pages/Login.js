import React, { useState, useEffect } from "react";
import { IconUser, IconLock } from "@tabler/icons-react";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { login } from "../services/authService";
import ilustracion from "../assets/ilustracion_login.svg";
import "../styles/Login.css";

function Login() {
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [cargando, setCargando] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.mensajeCierre) {
      setSuccessMsg(location.state.mensajeCierre);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setCargando(true);

    try {
      const respuesta = await login(correo, contraseña);
      setSuccessMsg(respuesta.mensaje || "Inicio de sesión exitoso.");
      
      setTimeout(() => {
        navigate("/dashboard"); 
      }, 1500);
    } catch (error) {
      const mensajeError = error.response?.data?.error || "Error de conexión con el servidor";
      setErrorMsg(mensajeError);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="contenedor-principal-login">
      <div className="login-contenedor">
        <div className="login-formulario">
          <h2>INICIA SESIÓN</h2>
          <p>Gestiona tu negocio fácilmente</p>

          {errorMsg && (
            <div className="alerta-error-login" style={{ color: 'red', marginBottom: '15px', textAlign: 'center' }}>
              <strong>{errorMsg}</strong>
            </div>
          )}

          {successMsg && (
            <div className="alerta-exito-login" style={{ color: 'green', marginBottom: '15px', textAlign: 'center' }}>
              <strong>{successMsg}</strong>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="login-input">
              <IconUser size={25} />
              <input
                placeholder="Correo Electrónico"
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
                disabled={cargando}
              />
            </div>

            <div className="login-input">
              <IconLock size={25} />
              <input
                placeholder="Contraseña"
                type="password"
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
                required
                disabled={cargando}
              />
            </div>

            <button className="boton-inicio" type="submit" disabled={cargando}>
              <strong>{cargando ? "Cargando..." : "Iniciar Sesión"}</strong>
            </button>
            <div className="registro-link">
              <p>
                ¿No tienes una cuenta? <Link to="/registro">Regístrate</Link>
              </p>
            </div>
          </form>

          <div className="separador-login">
            <div className="linea"></div>
            <p>
              <strong>Iniciar</strong> con otros
            </p>
            <div className="linea"></div>
          </div>

          <div className="login-opciones">
            <button className="google-login" type="button">
              <FcGoogle size={30} />
              <span>
                Iniciar con <strong>Google</strong>
              </span>
            </button>
            <Link to="/recuperarContraseña">¿Olvidaste tu Contraseña?</Link>
          </div>
        </div>

        <div className="login-ilustracion">
          <img src={ilustracion} alt="Ilustración Login" />
        </div>
      </div>
    </div>
  );
}

export default Login;
