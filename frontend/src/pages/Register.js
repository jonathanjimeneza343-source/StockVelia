import React, { useState } from "react";
import {
  IconUser,
  IconLock,
  IconMail,
  IconBuildingStore,
} from "@tabler/icons-react";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { register } from "../services/authService";
import Checkbox from "../components/Checkbox";
import ilustracion from "../assets/ilustracion_register.svg";
import "../styles/Register.css";

function Register() {
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [nombreEmpresa, setNombreEmpresa] = useState("");
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [confirmarContraseña, setConfirmarContraseña] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (contraseña !== confirmarContraseña) {
      setErrorMsg("Las contraseñas no coinciden");
      return;
    }

    setCargando(true);

    try {
      const respuesta = await register({
        nombre_empresa: nombreEmpresa,
        nombre_usuario: nombres,
        apellido_usuario: apellidos,
        email: correo,
        password: contraseña
      });
      
      setSuccessMsg(respuesta.mensaje || "Empresa y Usuario Administrador registrados con éxito.");
      
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      const mensajeError = error.response?.data?.error || error.response?.data?.mensaje || error.message;
      setErrorMsg(mensajeError);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="contenedor-principal-registro">
      <div className="registro-contenedor">
        <div className="registro-ilustracion">
          <img src={ilustracion} alt="Ilustración Register" />
        </div>

        <div className="registro-formulario">
          <h2>REGISTRATE</h2>
          <p>Crea tu cuenta y gestiona tu inventario fácilmente</p>

          {errorMsg && (
            <div className="alerta-error-registro" style={{ color: 'red', marginBottom: '15px', textAlign: 'center' }}>
              <strong>{errorMsg}</strong>
            </div>
          )}

          {successMsg && (
            <div className="alerta-exito-registro" style={{ color: 'green', marginBottom: '15px', textAlign: 'center' }}>
              <strong>{successMsg}</strong>
            </div>
          )}

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
                  disabled={cargando}
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
                  disabled={cargando}
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
                  disabled={cargando}
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
                  disabled={cargando}
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
                  disabled={cargando}
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
                  disabled={cargando}
                />
              </div>
            </div>

            <div className="terminos">
              <Checkbox />
              <span>Acepto los términos y condiciones</span>
            </div>

            <button className="boton-registro" type="submit" disabled={cargando}>
              {cargando ? "Registrando..." : "Registrarse"}
            </button>

            <div className="login-opciones-registro">
              <strong>Registarse con otros</strong>

              <button className="google-login" type="button">
                <FcGoogle size={30} />
                <span>
                  Iniciar con <strong>Google</strong>
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
