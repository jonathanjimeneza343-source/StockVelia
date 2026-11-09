import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  IconUser,
  IconLock,
  IconMail,
  IconBuildingStore,
  IconEye,
  IconEyeOff,
  IconCheck,
  IconBellRinging,
  IconPackage,
} from "@tabler/icons-react";
import { FcGoogle } from "react-icons/fc";
import Swal from "sweetalert2";
import ilustracion from "../assets/ilustracion_register.svg";
import AuthBrand from "../components/AuthBrand";
import AuthBackdrop from "../components/AuthBackdrop";
import AuthTopBar from "../components/AuthTopBar";
import "../styles/Auth.css";

const CHIPS = [
  {
    tone: "ok",
    icon: <IconPackage size={18} />,
    title: "Producto registrado",
    sub: "Arroz 500 g · 18 uds",
  },
  {
    tone: "warn",
    icon: <IconBellRinging size={18} />,
    title: "Alerta configurada",
    sub: "Aviso cuando baje de 10 uds",
  },
];

const STEPS = ["Crea tu cuenta", "Registra tus productos", "Empieza a controlar"];

function Register() {
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [nombreEmpresa, setNombreEmpresa] = useState("");
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [confirmarContraseña, setConfirmarContraseña] = useState("");
  const [acepta, setAcepta] = useState(false);
  const [ver, setVer] = useState(false);
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();

  // Requisitos en vivo (los mismos que valida el submit)
  const reqs = [
    ["6 o más caracteres", contraseña.length >= 6],
    ["Una mayúscula", /[A-Z]/.test(contraseña)],
    ["Una minúscula", /[a-z]/.test(contraseña)],
    ["Un número", /\d/.test(contraseña)],
  ];

  const hayConfirmacion = confirmarContraseña.length > 0;
  const coinciden = contraseña === confirmarContraseña;

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

  const eye = (
    <button
      type="button"
      className="au-eye"
      onClick={() => setVer(!ver)}
      aria-label={ver ? "Ocultar contraseñas" : "Mostrar contraseñas"}
      aria-pressed={ver}
    >
      {ver ? <IconEyeOff size={20} /> : <IconEye size={20} />}
    </button>
  );

  return (
    <div className="au-page au-page--register">
      <AuthBackdrop />
      <AuthTopBar />

      <div className="au-card au-card--register">
        <AuthBrand
          illustration={ilustracion}
          title="Crea tu cuenta gratis."
          text="Registra tus productos y empieza a controlar tu inventario hoy."
          steps={STEPS}
          chips={CHIPS}
        />

        <section className="au-main">
          <div className="au-inner au-inner--wide">
            <header className="au-head">
              <h1>Regístrate</h1>
              <p>Crea tu cuenta y gestiona tu inventario fácilmente</p>
            </header>

            <form className="au-form au-form--grid" onSubmit={handleSubmit}>
              <div className="au-field">
                <label className="au-label" htmlFor="reg-nombres">
                  Nombres
                </label>
                <div className="au-control">
                  <IconUser size={20} className="au-ico" />
                  <input
                    id="reg-nombres"
                    placeholder="Laura"
                    type="text"
                    autoComplete="given-name"
                    value={nombres}
                    onChange={(e) => setNombres(e.target.value)}
                    required
                    disabled={cargando}
                  />
                </div>
              </div>

              <div className="au-field">
                <label className="au-label" htmlFor="reg-apellidos">
                  Apellidos
                </label>
                <div className="au-control">
                  <IconUser size={20} className="au-ico" />
                  <input
                    id="reg-apellidos"
                    placeholder="Martínez"
                    type="text"
                    autoComplete="family-name"
                    value={apellidos}
                    onChange={(e) => setApellidos(e.target.value)}
                    required
                    disabled={cargando}
                  />
                </div>
              </div>

              <div className="au-field">
                <label className="au-label" htmlFor="reg-negocio">
                  Nombre del negocio
                </label>
                <div className="au-control">
                  <IconBuildingStore size={20} className="au-ico" />
                  <input
                    id="reg-negocio"
                    placeholder="Tienda La Esquina"
                    type="text"
                    autoComplete="organization"
                    value={nombreEmpresa}
                    onChange={(e) => setNombreEmpresa(e.target.value)}
                    required
                    disabled={cargando}
                  />
                </div>
              </div>

              <div className="au-field">
                <label className="au-label" htmlFor="reg-correo">
                  Correo
                </label>
                <div className="au-control">
                  <IconMail size={20} className="au-ico" />
                  <input
                    id="reg-correo"
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
                <label className="au-label" htmlFor="reg-pass">
                  Contraseña
                </label>
                <div className="au-control">
                  <IconLock size={20} className="au-ico" />
                  <input
                    id="reg-pass"
                    placeholder="Crea una contraseña"
                    type={ver ? "text" : "password"}
                    autoComplete="new-password"
                    value={contraseña}
                    onChange={(e) => setContraseña(e.target.value)}
                    required
                    disabled={cargando}
                  />
                  {eye}
                </div>
              </div>

              <div className="au-field">
                <label className="au-label" htmlFor="reg-pass2">
                  Confirmar contraseña
                </label>
                <div
                  className={`au-control ${
                    hayConfirmacion ? (coinciden ? "is-ok" : "is-bad") : ""
                  }`}
                >
                  <IconLock size={20} className="au-ico" />
                  <input
                    id="reg-pass2"
                    placeholder="Repite la contraseña"
                    type={ver ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmarContraseña}
                    onChange={(e) => setConfirmarContraseña(e.target.value)}
                    required
                    disabled={cargando}
                    aria-invalid={hayConfirmacion && !coinciden}
                  />
                  {eye}
                </div>
                <span className="au-hint" role="status" aria-live="polite">
                  {hayConfirmacion && !coinciden ? "Las contraseñas no coinciden" : ""}
                </span>
              </div>

              <ul className="au-reqs au-span" aria-label="Requisitos de la contraseña">
                {reqs.map(([label, ok]) => (
                  <li key={label} className={ok ? "ok" : ""}>
                    <IconCheck size={14} stroke={3} />
                    {label}
                  </li>
                ))}
              </ul>

              <label className="au-check au-span">
                <input
                  type="checkbox"
                  checked={acepta}
                  onChange={(e) => setAcepta(e.target.checked)}
                  required
                  disabled={cargando}
                />
                <span className="au-box">
                  <IconCheck size={14} stroke={3.5} />
                </span>
                <span>Acepto los términos y condiciones</span>
              </label>

              <button className="au-btn au-span" type="submit" disabled={cargando}>
                {cargando && <span className="au-spin" aria-hidden="true" />}
                <span>{cargando ? "Registrando…" : "Registrarse"}</span>
              </button>
            </form>

            <div className="au-or">
              <span>o</span>
            </div>

            <button type="button" className="au-google" onClick={handleGoogleRegister}>
              <FcGoogle size={22} />
              <span>
                Registrarse con <strong>Google</strong>
              </span>
            </button>

            <p className="au-switch">
              ¿Ya tienes una cuenta?{" "}
              <Link to="/login" className="au-link">
                Inicia sesión
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Register;