import React, { useState, useEffect, useRef } from "react";
import { IconUserCircle, IconBuildingStore, IconChevronDown, IconPlus, IconX, IconCheck } from "@tabler/icons-react";
import api from "../services/api";
import "../styles/Header.css";

function Header() {
  const usuario = JSON.parse(localStorage.getItem("usuario")) || {};
  const empresasDisponibles = usuario.empresasDisponibles || [];
  const esAdmin = usuario.id_rol === 1;

  // Estados para el menú desplegable personalizado y el modal
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [nombreNuevaEmpresa, setNombreNuevaEmpresa] = useState("");
  const [cargando, setCargando] = useState(false);
  
  const menuRef = useRef(null);

  const empresaActual = empresasDisponibles.find(
    (emp) => emp.id_empresa === Number(usuario.id_empresa)
  );
  const nombreEmpresaActual = empresaActual ? empresaActual.nombre_empresa : (usuario.nombre_empresa || "StockVelia");

  // Cerrar el menú si se hace clic fuera de él
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
    if (id_empresa === Number(usuario.id_empresa)) return;

    try {
      const response = await api.post("/auth/change-company", {
        id_empresa: Number(id_empresa),
      });

      const usuarioActualizado = {
        ...usuario,
        id_empresa: response.data.id_empresa,
        nombre_empresa: response.data.nombre_empresa,
      };
      
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));

      window.location.reload();
    } catch (error) {
      console.error("Error al cambiar de empresa:", error);
      alert("No se pudo cambiar de empresa.");
    }
  };

  const handleCrearEmpresa = async (e) => {
    e.preventDefault();
    if (!nombreNuevaEmpresa.trim()) return;

    try {
      setCargando(true);
      await api.post("/auth/register", {
        nombre_empresa: nombreNuevaEmpresa,
        nombre_usuario: usuario.nombre?.split(" ")[0] || "Usuario",
        apellido_usuario: usuario.nombre?.split(" ").slice(1).join(" ") || "",
        email: usuario.correo,
        password: "TempPassword123*"
      });

      alert("¡Microempresa creada con éxito! Por favor vuelve a iniciar sesión.");
      setModalAbierto(false);
      
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      window.location.href = "/login";
    } catch (error) {
      console.error("Error al crear la empresa:", error);
      alert(error.response?.data?.error || "Error al registrar la nueva empresa.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <>
      <header className="header">
        <div className="header-titulo">
          {empresasDisponibles.length > 0 ? (
            /* Menú desplegable personalizado moderno */
            <div className="dropdown-container" ref={menuRef}>
              <div 
                className="dropdown-trigger" 
                onClick={() => setMenuAbierto(!menuAbierto)}
              >
                <div className="selector-empresa-icon-container">
                  <IconBuildingStore size={18} className="icono-tienda" />
                </div>
                <span className="texto-empresa-activo">{nombreEmpresaActual}</span>
                <IconChevronDown size={14} className={`icono-flecha ${menuAbierto ? "girar" : ""}`} />
              </div>

              {menuAbierto && (
                <div className="dropdown-menu-custom">
                  <div className="dropdown-header-label">Cambiar de empresa</div>
                  {empresasDisponibles.map((emp) => {
                    const esActiva = emp.id_empresa === Number(usuario.id_empresa);
                    return (
                      <div
                        key={emp.id_empresa}
                        className={`dropdown-item ${esActiva ? "activo" : ""}`}
                        onClick={() => handleSeleccionarEmpresa(emp.id_empresa)}
                      >
                        <span>{emp.nombre_empresa}</span>
                        {esActiva && <IconCheck size={16} className="icono-check" />}
                      </div>
                    );
                  })}

                  {esAdmin && (
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
            /* Insignia fija si solo tiene una empresa */
            <div className="badge-empresa-unica">
              <IconBuildingStore size={18} className="icono-tienda" />
              <span className="texto-empresa-unica">{nombreEmpresaActual}</span>
            </div>
          )}
          <span className="header-subtitulo">Panel de Control General</span>
        </div>

        <div className="header-usuario">
          <div className="datos-usuario">
            <span className="nombre-usuario-txt">{usuario?.nombre || "Usuario"}</span>
            <small className="rol-usuario-txt">{esAdmin ? "Administrador" : "Empleado"}</small>
          </div>

          <div className="avatar">
            {usuario?.nombre ? (
              usuario.nombre.charAt(0).toUpperCase()
            ) : (
              <IconUserCircle size={26} />
            )}
          </div>
        </div>
      </header>

      {/* MODAL PARA CREAR NUEVA EMPRESA */}
      {modalAbierto && esAdmin && (
        <div className="modal-overlay">
          <div className="modal-contenido">
            <div className="modal-header">
              <h3>Registrar Nueva Microempresa</h3>
              <button className="modal-cerrar" onClick={() => setModalAbierto(false)}>
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

              <p className="modal-info">
                Esta microempresa se asociará a tu cuenta actual ({usuario.correo}), manteniendo inventarios independientes.
              </p>

              <div className="modal-acciones">
                <button type="button" className="btn-cancelar" onClick={() => setModalAbierto(false)}>
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