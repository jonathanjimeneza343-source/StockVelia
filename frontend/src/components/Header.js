import React, { useState, useEffect, useRef } from "react";
import {
  IconUserCircle,
  IconBuildingStore,
  IconChevronDown,
  IconPlus,
  IconX,
  IconCheck,
} from "@tabler/icons-react";
import Swal from "sweetalert2";
import api from "../services/api";
import {
  aplicarColorTemaEmpresa,
  obtenerUrlAvatar,
  obtenerNombreRol,
} from "../utils/temaEmpresa";
import "../styles/Header.css";

const COLORES_EMPRESA = [
  "#5e059e",
  "#d97706",
  "#059669",
  "#2563eb",
  "#dc2626",
  "#4338ca",
];

function obtenerUsuarioGuardado() {
  try {
    return JSON.parse(localStorage.getItem("usuario")) || {};
  } catch {
    return {};
  }
}

function Header({ setSeccion, usuarioProp }) {
  const usuario = usuarioProp || obtenerUsuarioGuardado();
  const empresasDisponibles = usuario.empresasDisponibles || [];
  const esPropietario = Number(usuario.id_rol) === 1;

  const [menuAbierto, setMenuAbierto] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [nombreNuevaEmpresa, setNombreNuevaEmpresa] = useState("");
  const [passwordNuevaEmpresa, setPasswordNuevaEmpresa] = useState("");
  const [colorNuevaEmpresa, setColorNuevaEmpresa] = useState("#5e059e");
  const [cargando, setCargando] = useState(false);
  const menuRef = useRef(null);

  const empresaActual = empresasDisponibles.find(
    (emp) => Number(emp.id_empresa) === Number(usuario.id_empresa)
  );
  const nombreEmpresaActual = empresaActual
    ? empresaActual.nombre_empresa
    : usuario.nombre_empresa || "StockVelia";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAbierto(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSeleccionarEmpresa = async (id_empresa) => {
    setMenuAbierto(false);
    if (Number(id_empresa) === Number(usuario.id_empresa)) return;

    try {
      const response = await api.post("/auth/change-company", {
        id_empresa: Number(id_empresa),
      });

      const nuevoColor =
        response.data.color_tema ||
        empresasDisponibles.find(
          (e) => Number(e.id_empresa) === Number(id_empresa)
        )?.color_tema ||
        "#5e059e";

      const usuarioActualizado = {
        ...usuario,
        id_empresa: response.data.id_empresa,
        nombre_empresa: response.data.nombre_empresa,
        color_tema: nuevoColor,
      };

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));
      aplicarColorTemaEmpresa(nuevoColor);
      window.location.reload();
    } catch (error) {
      Swal.fire({
        icon: "error",
        iconColor: "#5e059e",
        title: "Error",
        text: error.response?.data?.error || "No se pudo cambiar de empresa.",
        confirmButtonColor: "#5e059e",
      });
    }
  };

  const handleCrearEmpresa = async (e) => {
    e.preventDefault();
    const nombreLimpio = nombreNuevaEmpresa.trim();
    if (!nombreLimpio || !passwordNuevaEmpresa) return;

    try {
      setCargando(true);
      const partesNombre = (usuario.nombre || "Usuario").trim().split(/\s+/);
      const response = await api.post("/auth/register", {
        nombre_empresa: nombreLimpio,
        nombre_usuario: partesNombre[0] || "Usuario",
        apellido_usuario: partesNombre.slice(1).join(" ") || "",
        email: usuario.correo,
        password: passwordNuevaEmpresa,
        color_tema: colorNuevaEmpresa,
      });

      setModalAbierto(false);
      setNombreNuevaEmpresa("");
      setPasswordNuevaEmpresa("");

      if (response.data?.token && response.data?.usuario) {
        const nuevoUsuarioResp = response.data.usuario;
        const listaPrev = usuario.empresasDisponibles || [];
        const existeEnLista = listaPrev.some(
          (emp) => Number(emp.id_empresa) === Number(nuevoUsuarioResp.id_empresa)
        );
        const listaCombinada =
          nuevoUsuarioResp.empresasDisponibles?.length > 0
            ? nuevoUsuarioResp.empresasDisponibles
            : existeEnLista
            ? listaPrev
            : [
                ...listaPrev,
                {
                  id_empresa: nuevoUsuarioResp.id_empresa,
                  nombre_empresa:
                    nuevoUsuarioResp.nombre_empresa || nombreLimpio,
                  color_tema: nuevoUsuarioResp.color_tema || colorNuevaEmpresa,
                },
              ];

        const usuarioFinal = {
          ...nuevoUsuarioResp,
          color_tema: nuevoUsuarioResp.color_tema || colorNuevaEmpresa,
          empresasDisponibles: listaCombinada,
        };

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("usuario", JSON.stringify(usuarioFinal));
        aplicarColorTemaEmpresa(usuarioFinal.color_tema);

        await Swal.fire({
          icon: "success",
          iconColor: usuarioFinal.color_tema,
          title: "¡Nueva empresa creada!",
          text: "Se cambió al contexto de tu nueva empresa.",
          timer: 1400,
          showConfirmButton: false,
        });
        window.location.reload();
        return;
      }

      await Swal.fire({
        icon: "success",
        iconColor: "#5e059e",
        title: "¡Microempresa creada!",
        text: "Vuelve a iniciar sesión para seleccionar tu nueva empresa.",
        confirmButtonColor: "#5e059e",
      });
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      window.location.href = "/login";
    } catch (error) {
      Swal.fire({
        icon: "error",
        iconColor: "#5e059e",
        title: "Error al registrar empresa",
        text:
          error.response?.data?.error ||
          "No se pudo registrar la nueva empresa.",
        confirmButtonColor: "#5e059e",
      });
    } finally {
      setCargando(false);
    }
  };

  const urlAvatar = obtenerUrlAvatar(usuario?.foto_perfil);

  return (
    <>
      <header className="header">
        <div className="header-titulo">
          {empresasDisponibles.length > 0 || esPropietario ? (
            <div className="dropdown-container" ref={menuRef}>
              <div
                className="dropdown-trigger"
                onClick={() => setMenuAbierto(!menuAbierto)}
              >
                <div className="selector-empresa-icon-container">
                  <IconBuildingStore size={18} className="icono-tienda" />
                </div>
                <span className="texto-empresa-activo">
                  {nombreEmpresaActual}
                </span>
                <IconChevronDown
                  size={14}
                  className={`icono-flecha ${menuAbierto ? "girar" : ""}`}
                />
              </div>
              {menuAbierto && (
                <div className="dropdown-menu-custom">
                  <div className="dropdown-header-label">
                    Cambiar de empresa
                  </div>
                  {empresasDisponibles.map((emp) => {
                    const esActiva =
                      Number(emp.id_empresa) === Number(usuario.id_empresa);
                    return (
                      <div
                        key={emp.id_empresa}
                        className={`dropdown-item ${esActiva ? "activo" : ""}`}
                        onClick={() => handleSeleccionarEmpresa(emp.id_empresa)}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <span
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              backgroundColor: emp.color_tema || "#5e059e",
                            }}
                          />
                          {emp.nombre_empresa}
                        </span>
                        {esActiva && (
                          <IconCheck size={16} className="icono-check" />
                        )}
                      </div>
                    );
                  })}
                  {esPropietario && (
                    <>
                      <div className="dropdown-divider"></div>
                      <div
                        className="dropdown-item opcion-nueva-custom"
                        onClick={() => {
                          setMenuAbierto(false);
                          setModalAbierto(true);
                        }}
                      >
                        <IconPlus size={16} />
                        <span>Registrar nueva empresa...</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="badge-empresa-unica">
              <IconBuildingStore size={18} className="icono-tienda" />
              <span className="texto-empresa-unica">{nombreEmpresaActual}</span>
            </div>
          )}
          <span className="header-subtitulo">Panel de Control General</span>
        </div>

        <div
          className="header-usuario"
          onClick={() => typeof setSeccion === "function" && setSeccion("perfil")}
          title="Ver o editar mi perfil"
          style={{
            cursor: typeof setSeccion === "function" ? "pointer" : "default",
          }}
        >
          <div className="datos-usuario">
            <span className="nombre-usuario-txt">
              {usuario?.nombre || "Usuario"}
            </span>
            <small className="rol-usuario-txt">
              {obtenerNombreRol(usuario?.id_rol)}
            </small>
          </div>
          <div className="avatar">
            {urlAvatar ? (
              <img
                src={urlAvatar}
                alt={usuario?.nombre || "Avatar"}
                className="avatar-img"
              />
            ) : usuario?.nombre ? (
              usuario.nombre.charAt(0).toUpperCase()
            ) : (
              <IconUserCircle size={26} />
            )}
          </div>
        </div>
      </header>

      {modalAbierto && esPropietario && (
        <div className="modal-overlay">
          <div className="modal-contenido">
            <div className="modal-header">
              <h3>Registrar Nueva Microempresa</h3>
              <button
                type="button"
                className="modal-cerrar"
                onClick={() => setModalAbierto(false)}
              >
                <IconX size={20} />
              </button>
            </div>
            <form onSubmit={handleCrearEmpresa}>
              <div className="form-group">
                <label>Nombre de la nueva empresa</label>
                <input
                  type="text"
                  placeholder="Ej: Tienda Don Pedro"
                  value={nombreNuevaEmpresa}
                  onChange={(e) => setNombreNuevaEmpresa(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Color distintivo del entorno</label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {COLORES_EMPRESA.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setColorNuevaEmpresa(hex)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        backgroundColor: hex,
                        border:
                          colorNuevaEmpresa === hex
                            ? "3px solid #111827"
                            : "2px solid transparent",
                        cursor: "pointer",
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Contraseña para el acceso</label>
                <input
                  type="password"
                  placeholder="Mín. 6 caracteres, mayúscula, minúscula y número"
                  value={passwordNuevaEmpresa}
                  onChange={(e) => setPasswordNuevaEmpresa(e.target.value)}
                  required
                />
              </div>
              <p className="modal-info">
                Esta microempresa se asociará a tu cuenta actual ({usuario.correo}
                ), manteniendo inventarios independientes.
              </p>
              <div className="modal-acciones">
                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={() => setModalAbierto(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar" disabled={cargando}>
                  {cargando ? "Registrando..." : "Crear Empresa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;