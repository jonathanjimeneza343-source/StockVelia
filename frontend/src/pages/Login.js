import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconUser, IconLock } from "@tabler/icons-react";
import { FcGoogle } from "react-icons/fc";
import ilustracion from "../assets/ilustracion_login.svg";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import "../styles/Login.css";

function Login() {
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);

    try {
      const respuesta = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correo,
          password: contraseña,
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        Swal.fire({
          icon: "error",
          iconColor: "#5e059e",
          title: "Oops...",
          text: datos.error || "Hubo un error al iniciar sesión",
          confirmButtonColor: "#5e059e",
        });
        return;
      }

      localStorage.setItem("token", datos.token);
      localStorage.setItem("usuario", JSON.stringify(datos.usuario));

      Swal.fire({
        icon: "success",
        iconColor: "#5e059e",
        title: "¡Bienvenido!",
        text: "Inicio de sesión exitoso",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        navigate("/dashboard");
      });

    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        iconColor: "#5e059e",
        title: "Error de conexión",
        text: "No se pudo conectar con el servidor",
        confirmButtonColor: "#5e059e",
      });
    } finally {
      setCargando(false);
    }
  };

  const handleGoogleLogin = () => {
    Swal.fire({
      icon: "info",
      iconColor: "#5e059e",
      title: "Próximamente",
      text: "El inicio de sesión con Google estará disponible muy pronto.",
      confirmButtonColor: "#5e059e",
    });
  };

  return (
    <div className="contenedor-principal-login">
      <div className="login-contenedor">
        <div className="login-formulario">
          <h2>INICIA SESIÓN</h2>
          <p>Gestiona tu negocio fácilmente</p>

          <form onSubmit={handleSubmit}>
            <div className="login-input">
              <IconUser size={22} className="icono-login" />
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
              <IconLock size={22} className="icono-login" />
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
              <strong>{cargando ? "Iniciando..." : "Iniciar Sesión"}</strong>
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
            <button type="button" className="google-login" onClick={handleGoogleLogin}>
              <FcGoogle size={24} />
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