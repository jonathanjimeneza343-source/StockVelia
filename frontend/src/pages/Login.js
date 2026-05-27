// src/pages/Login.js
import React, { useState } from "react";
import { IconUser, IconLock } from "@tabler/icons-react";
import { FcGoogle } from "react-icons/fc";
import ilustracion from "../assets/ilustracion_login.svg"
import "../styles/Login.css"

function Login() {
    const [correo, setCorreo] = useState("");
    const [contraseña, setContraseña] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        // Aquí iría la lógica para enviar datos al backend
        console.log("Correo:", correo, "Contraseña:", contraseña);
    };

    return (
        <div className="contenedor-principal-login">
            <div className="login-contenedor">
                {/* Sección izquierda: formulario */}
                <div className="login-formulario">
                    <h2>INICIA SESIÓN</h2>
                    <p>Gestiona tu negocio fácilmente</p>

                    <form onSubmit={handleSubmit}>
                        <div className="input-contenedor">
                            <IconUser size={25} />
                            <input
                                placeholder="Correo Eléctronico"
                                type="email"
                                value={correo}
                                onChange={(e) => setCorreo(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-contenedor">
                            <IconLock size={25} />
                            <input
                                placeholder="Contraseña"
                                type="password"
                                value={contraseña}
                                onChange={(e) => setContraseña(e.target.value)}
                                required
                            />
                        </div>

                        <button className="boton-inicio" type="submit">Iniciar Sesión</button>
                    </form>

                    <p><strong>Iniciar</strong> con otros</p>

                    <div className="login-opciones">
                        <button className="google-login">
                            <FcGoogle size={30} />
                            <span>Iniciar con <strong>Google</strong></span>
                        </button>
                        <a href="/recuperar">¿Olvidaste tu Contraseña?</a>
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
