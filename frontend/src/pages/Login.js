import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  IconMail,
  IconLock,
  IconEye,
  IconEyeOff,
  IconArrowLeft,
  IconBellRinging,
  IconPackage,
} from "@tabler/icons-react";
import { FcGoogle } from "react-icons/fc";
import Swal from "sweetalert2";
import ilustracion from "../assets/ilustracion_login.svg";
import AuthBrand from "../components/AuthBrand";
import "../styles/Auth.css";

const CHIPS = [
  {
    tone: "warn",
    icon: <IconBellRinging size={18} />,
    title: "Aceite 1 L bajó de su mínimo",
    sub: "Quedan 7 uds · mínimo 8",
  },
  {
    tone: "ok",
    icon: <IconPackage size={18} />,
    title: "Entrada registrada",
    sub: "Aceite 1 L · +24 uds",
  },
];

function Login() {
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [cargando, setCargando] = useState(false);
  const [ver, setVer] = useState(false);

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
    <div className="au-page au-page--login">
      <div className="au-card au-card--login">
        <section className="au-main">
          <Link to="/" className="au-back">
            <IconArrowLeft size={18} />
            Volver al inicio
          </Link>

          <div className="au-inner">
            <header className="au-head">
              <h1>Inicia sesión</h1>
              <p>Gestiona tu negocio fácilmente</p>
            </header>

            <form className="au-form" onSubmit={handleSubmit}>
              <div className="au-field">
                <label className="au-label" htmlFor="login-correo">
                  Correo electrónico
                </label>
                <div className="au-control">
                  <IconMail size={20} className="au-ico" />
                  <input
                    id="login-correo"
                    placeholder="nombre@correo.com"
                    type="email"
                    autoComplete="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    required
                    disabled={cargando}
                  />
                </div>
              </div>

              <div className="au-field">
                <div className="au-top">
                  <label className="au-label" htmlFor="login-pass">
                    Contraseña
                  </label>
                  <Link to="/recuperarContraseña" className="au-link au-link--sm">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="au-control">
                  <IconLock size={20} className="au-ico" />
                  <input
                    id="login-pass"
                    placeholder="Tu contraseña"
                    type={ver ? "text" : "password"}
                    autoComplete="current-password"
                    value={contraseña}
                    onChange={(e) => setContraseña(e.target.value)}
                    required
                    disabled={cargando}
                  />
                  <button
                    type="button"
                    className="au-eye"
                    onClick={() => setVer(!ver)}
                    aria-label={ver ? "Ocultar contraseña" : "Mostrar contraseña"}
                    aria-pressed={ver}
                  >
                    {ver ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                  </button>
                </div>
              </div>

              <button className="au-btn" type="submit" disabled={cargando}>
                {cargando && <span className="au-spin" aria-hidden="true" />}
                <span>{cargando ? "Iniciando…" : "Iniciar sesión"}</span>
              </button>
            </form>

            <div className="au-or">
              <span>o</span>
            </div>

            <button type="button" className="au-google" onClick={handleGoogleLogin}>
              <FcGoogle size={22} />
              <span>
                Iniciar con <strong>Google</strong>
              </span>
            </button>

            <p className="au-switch">
              ¿No tienes una cuenta?{" "}
              <Link to="/registro" className="au-link">
                Regístrate
              </Link>
            </p>
          </div>
        </section>

        <AuthBrand
          illustration={ilustracion}
          title="Tu inventario, bajo control."
          text="Existencias en tiempo real, alertas antes de que se agote y reportes listos para tu contabilidad."
          chips={CHIPS}
        />
      </div>
    </div>
  );
}

export default Login;