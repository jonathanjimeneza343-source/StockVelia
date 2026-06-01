import React, { useState } from "react";
import {
  IconUser,
  IconLock,
  IconMail,
  IconBuildingStore,
} from "@tabler/icons-react";
import ilustracion from "../assets/ilustracion_register.svg";

import "../styles/Register.css";

function Register() {
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [nombreEmpresa, setNombreEmpresa] = useState("");
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [confirmarContraseña, setConfirmarContraseña] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (contraseña !== confirmarContraseña) {
      alert("Las contraseñas no coinciden");
      return;
    }

    console.log({
      nombres,
      apellidos,
      nombreEmpresa,
      correo,
      contraseña,
    });
  };

  return (
    <div className="contenedor-principal-registro">
      <div className="registro-contenedor">
        {/* Sección derecha: ilustración */}
        <div className="registro-ilustracion">
          <img src={ilustracion} alt="Ilustración Register" />
        </div>

        {/* Sección derecha: formulario */}
        <div className="registro-formulario">
          <h2>REGISTRATE</h2>
          <p>Crea tu cuenta y gestiona tu inventario fácilmente</p>

          <form onSubmit={handleSubmit}>
            <div className="formulario-registro">
              <div className="registro-input">
                <IconUser size={25} />
                <input
                  placeholder="Nombres"
                  type="text"
                  value={nombres}
                  onChange={(e) => setNombres(e.target.value)}
                  required
                />
              </div>

              <div className="registro-input">
                <IconUser size={25} />
                <input
                  placeholder="Apellidos"
                  type="text"
                  value={apellidos}
                  onChange={(e) => setApellidos(e.target.value)}
                  required
                />
              </div>

              <div className="registro-input">
                <IconBuildingStore size={25} />
                <input
                  placeholder="Nombre del negocio"
                  type="text"
                  value={nombreEmpresa}
                  onChange={(e) => setNombreEmpresa(e.target.value)}
                  required
                />
              </div>

              <div className="registro-input">
                <IconMail size={25} />
                <input
                  placeholder="Correo"
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  required
                />
              </div>

              <div className="registro-input">
                <IconLock size={25} />
                <input
                  placeholder="Contraseña"
                  type="password"
                  value={contraseña}
                  onChange={(e) => setContraseña(e.target.value)}
                  required
                />
              </div>

              <div className="registro-input">
                <IconLock size={25} />
                <input
                  placeholder="Confirmar contraseña"
                  type="password"
                  value={confirmarContraseña}
                  onChange={(e) => setConfirmarContraseña(e.target.value)}
                  required
                />
              </div>
            </div>

            <button className="boton-registro" type="submit">
              Registrarse
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
