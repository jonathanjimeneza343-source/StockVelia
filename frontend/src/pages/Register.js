import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  IconUser,
  IconLock,
  IconMail,
  IconBuildingStore,
} from "@tabler/icons-react";
import { FcGoogle } from "react-icons/fc";
import Checkbox from "../components/Checkbox";
import ilustracion from "../assets/ilustracion_register.svg";
import Swal from "sweetalert2";
import "../styles/Register.css";

function Register() {
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [nombreEmpresa, setNombreEmpresa] = useState("");
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [confirmarContraseña, setConfirmarContraseña] = useState("");
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!passwordRegex.test(contraseña)) {
      Swal.fire({
        icon: "warning",
        iconColor: "#5e059e",
        title: "Contraseña insegura",
        text: "La contraseña debe tener al menos 6 caracteres, una letra mayúscula, una minúscula y un número.",
        confirmButtonColor: "#5e059e",
      });
      return;
    }

    if (contraseña !== confirmarContraseña) {
      Swal.fire({
        icon: "error",
        iconColor: "#5e059e",
        title: "Oops...",
        text: "Las contraseñas no coinciden",
        confirmButtonColor: "#5e059e",
      });
      return;
    }

    setCargando(true);

    try {
      const respuesta = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre_empresa: nombreEmpresa,
          nombre_usuario: nombres,
          apellido_usuario: apellidos,
          email: correo,
          password: contraseña,
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        Swal.fire({
          icon: "error",
          iconColor: "#5e059e",
          title: "Oops...",
          text: datos.error || "Hubo un error al registrarse",
          confirmButtonColor: "#5e059e",
        });
        return;
      }

      Swal.fire({
        icon: "success",
        iconColor: "#5e059e",
        title: "¡Registro exitoso!",
        text: "Usuario registrado correctamente",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        navigate("/");
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

  const handleGoogleRegister = () => {
    Swal.fire({
      icon: "info",
      iconColor: "#5e059e",
      title: "Próximamente",
      text: "El registro con Google estará disponible muy pronto.",
      confirmButtonColor: "#5e059e",
    });
  };

  return (
    <div className="contenedor-principal-registro">
      <div className="registro-contenedor">
        <div className="registro-ilustracion">
          <img src={ilustracion} alt="Ilustración Register" />
        </div>

        <div className="registro-formulario">
          <h2>REGÍSTRATE</h2>
          <p>Crea tu cuenta y gestiona tu inventario fácilmente</p>

          <form onSubmit={handleSubmit}>
            <div className="formulario-registro">
              <div className="registro-input">
                <IconUser size={22} className="icono-registro" />
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
                <IconUser size={22} className="icono-registro" />
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
                <IconBuildingStore size={22} className="icono-registro" />
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
                <IconMail size={22} className="icono-registro" />
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
                <IconLock size={22} className="icono-registro" />
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
                <IconLock size={22} className="icono-registro" />
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
              <strong>{cargando ? "Registrando..." : "Registrarse"}</strong>
            </button>

            <div className="login-opciones-registro">
              <div className="separador-registro">
                <div className="linea-reg"></div>
                <p><strong>Registrarse</strong> con otros</p>
                <div className="linea-reg"></div>
              </div>

              <button
                type="button"
                className="google-registro-btn"
                onClick={handleGoogleRegister}
              >
                <FcGoogle size={24} />
                <span>
                  Registrarse con <strong>Google</strong>
                </span>
              </button>

              <p className="registro-link">
                ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;