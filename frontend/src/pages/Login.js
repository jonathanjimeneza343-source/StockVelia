// src/pages/Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconUser, IconLock } from "@tabler/icons-react";
import { FcGoogle } from "react-icons/fc";
import ilustracion from "../assets/ilustracion_login.svg";
import { Link } from "react-router-dom";
import "../styles/Login.css";

function Login() {
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

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
        alert(datos.error);
        return;
      }

      localStorage.setItem("token", datos.token);
      
      localStorage.setItem("usuario", JSON.stringify(datos.usuario));

      alert("Inicio de sesión exitoso");

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Error al conectar con el servidor");
    }
  };

  return (
    <div className="contenedor-principal-login">
      <div className="login-contenedor">
        {/* Sección izquierda: formulario */}
        <div className="login-formulario">
          <h2>INICIA SESIÓN</h2>
          <p>Gestiona tu negocio fácilmente</p>

          <form onSubmit={handleSubmit}>
            <div className="login-input">
              <IconUser size={25} />
              <input
                placeholder="Correo Eléctronico"
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
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
              />
            </div>

            <button className="boton-inicio" type="submit">
              <strong>Iniciar Sesión</strong>
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
            <button className="google-login">
              <FcGoogle size={30} />
              <span>
                Iniciar con <strong>Google</strong>
              </span>
            </button>
            <a href="/recuperarContraseña">¿Olvidaste tu Contraseña?</a>
          </div>
        </div>

        {/* Sección derecha: ilustración */}
        <div className="login-ilustracion">
          <img src={ilustracion} alt="Ilustración Login" />
        </div>
      </div>
    </div>
  );
}

export default Login;
