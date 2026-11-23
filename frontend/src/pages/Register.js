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
import { register } from "../services/authService";
import ModalSeleccionarEmpresa from "../components/ModalSeleccionarEmpresa";
import { aplicarColorTemaEmpresa } from "../utils/temaEmpresa";
import Swal from "sweetalert2";
import "../styles/Register.css";

function Register() {
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [nombreEmpresa, setNombreEmpresa] = useState("");
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [confirmarContraseña, setConfirmarContraseña] = useState("");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [usuarioSelector, setUsuarioSelector] = useState(null);
  const navigate = useNavigate();

  const alternarTerminos = (e) => {
    if (cargando) return;
    if (e?.target && typeof e.target.checked === "boolean") {
      setAceptaTerminos(e.target.checked);
    } else {
      setAceptaTerminos((prev) => !prev);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !nombres.trim() ||
      !apellidos.trim() ||
      !nombreEmpresa.trim() ||
      !correo.trim() ||
      !contraseña ||
      !confirmarContraseña
    ) {
      Swal.fire({
        icon: "warning",
        iconColor: "#5e059e",
        title: "Campos obligatorios",
        text: "Por favor completa todos los campos del formulario.",
        confirmButtonColor: "#5e059e",
      });
      return;
    }

    if (!aceptaTerminos) {
      Swal.fire({
        icon: "warning",
        iconColor: "#5e059e",
        title: "Términos y condiciones",
        text: "Debes aceptar los términos y condiciones para crear tu cuenta.",
        confirmButtonColor: "#5e059e",
      });
      return;
    }

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
        title: "Contraseñas distintas",
        text: "Las contraseñas ingresadas no coinciden.",
        confirmButtonColor: "#5e059e",
      });
      return;
    }

    setCargando(true);
    try {
      const datos = await register({
        nombre_empresa: nombreEmpresa.trim(),
        nombre_usuario: nombres.trim(),
        apellido_usuario: apellidos.trim(),
        email: correo.trim().toLowerCase(),
        password: contraseña,
      });

      if (datos?.token && datos?.usuario) {
        localStorage.setItem("token", datos.token);
        localStorage.setItem("usuario", JSON.stringify(datos.usuario));
        aplicarColorTemaEmpresa(datos.usuario.color_tema);

        const empresas = datos.usuario.empresasDisponibles || [];
        if (Number(datos.usuario.id_rol) === 1 && empresas.length > 1) {
          setUsuarioSelector(datos.usuario);
          return;
        }

        await Swal.fire({
          icon: "success",
          iconColor: datos.usuario.color_tema || "#5e059e",
          title: "¡Registro exitoso!",
          text: "Bienvenido a StockVelia",
          timer: 1400,
          showConfirmButton: false,
        });
        navigate("/dashboard", { replace: true });
        return;
      }

      await Swal.fire({
        icon: "success",
        iconColor: "#5e059e",
        title: "¡Registro exitoso!",
        text: "Usuario registrado correctamente. Inicia sesión para continuar.",
        timer: 1500,
        showConfirmButton: false,
      });
      navigate("/login");
    } catch (error) {
      const mensajeError =
        error.response?.data?.error ||
        (error.request
          ? "No se pudo conectar con el servidor"
          : "Hubo un error al registrarse");
      Swal.fire({
        icon: "error",
        iconColor: "#5e059e",
        title: error.request ? "Error de conexión" : "No se pudo registrar",
        text: mensajeError,
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
          <form onSubmit={handleSubmit} noValidate>
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
            <div className="terminos" style={{ cursor: "pointer" }}>
              <Checkbox
                checked={aceptaTerminos}
                onChange={alternarTerminos}
                disabled={cargando}
              />
              <span onClick={() => !cargando && setAceptaTerminos((prev) => !prev)}>
                Acepto los términos y condiciones{" "}
                {aceptaTerminos ? "✓" : ""}
              </span>
            </div>
            <button className="boton-registro" type="submit" disabled={cargando}>
              <strong>{cargando ? "Registrando..." : "Registrarse"}</strong>
            </button>
            <div className="login-opciones-registro">
              <div className="separador-registro">
                <div className="linea-reg"></div>
                <p>
                  <strong>Registrarse</strong> con otros
                </p>
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
      {usuarioSelector && (
        <ModalSeleccionarEmpresa
          usuario={usuarioSelector}
          onSeleccionCompleta={() => {
            setUsuarioSelector(null);
            navigate("/dashboard", { replace: true });
          }}
        />
      )}
    </div>
  );
}

export default Register;