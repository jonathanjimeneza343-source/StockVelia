import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  getUsuarios,
  crearUsuario,
  actualizarUsuario,
  cambiarEstadoUsuario,
  eliminarUsuarioLogico,
} from "../../services/usuarioService";
import ModalUsuario from "./modales/ModalUsuario";
import { obtenerNombreRol } from "../../utils/temaEmpresa";
import "../../styles/Usuarios.css";
import Swal from "sweetalert2";

const cacheUsuariosPorEmpresa = new Map();
const peticionesUsuariosEnCurso = new Map();

function obtenerUsuarioGuardado() {
  try {
    return JSON.parse(localStorage.getItem("usuario")) || {};
  } catch {
    return {};
  }
}

function filtrarUsuariosActivos(lista) {
  return (Array.isArray(lista) ? lista : []).filter(
    (u) => !u.eliminado && String(u.estado_registro || "").toLowerCase() !== "eliminado"
  );
}

function Usuarios() {
  const usuarioActual = useMemo(() => obtenerUsuarioGuardado(), []);
  const idEmpresa = usuarioActual?.id_empresa;
  const cacheInicial = idEmpresa ? cacheUsuariosPorEmpresa.get(idEmpresa) : null;

  const [usuarios, setUsuarios] = useState(
    Array.isArray(cacheInicial) ? cacheInicial : []
  );
  const [cargando, setCargando] = useState(!cacheInicial);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioAEditar, setUsuarioAEditar] = useState(null);

  const esPropietario = Number(usuarioActual?.id_rol) === 1;
  const esAdminOperativo = Number(usuarioActual?.id_rol) === 2;

  const cargarUsuarios = useCallback(
    async (silencioso = false, forzarRed = false) => {
      if (!idEmpresa) {
        setCargando(false);
        return;
      }

      const tieneCache = cacheUsuariosPorEmpresa.has(idEmpresa);
      if (!silencioso && !tieneCache) {
        setCargando(true);
      }

      try {
        let promesa = peticionesUsuariosEnCurso.get(idEmpresa);
        if (!promesa || forzarRed) {
          promesa = getUsuarios()
            .then((data) => filtrarUsuariosActivos(data))
            .finally(() => {
              peticionesUsuariosEnCurso.delete(idEmpresa);
            });
          peticionesUsuariosEnCurso.set(idEmpresa, promesa);
        }

        const lista = await promesa;
        cacheUsuariosPorEmpresa.set(idEmpresa, lista);
        setUsuarios(lista);
      } catch (error) {
        if (!silencioso) {
          console.error("Error al cargar usuarios:", error);
          if (!tieneCache) {
            setUsuarios([]);
          }
        }
      } finally {
        if (!silencioso) {
          setCargando(false);
        }
      }
    },
    [idEmpresa]
  );

  useEffect(() => {
    let activo = true;

    const ejecutar = async () => {
      if (!activo) return;
      await cargarUsuarios(false, false);
    };

    ejecutar();
    return () => {
      activo = false;
    };
  }, [cargarUsuarios]);

  const puedeGestionarUsuario = (objetivo) => {
    const rolObjetivo = Number(objetivo.id_rol);
    // Nadie puede modificar al Propietario desde este panel
    if (rolObjetivo === 1) return false;
    // El Propietario gestiona Admin Operativos (2) y Empleados (3)
    if (esPropietario) return rolObjetivo === 2 || rolObjetivo === 3;
    // El Admin Operativo solo gestiona Empleados (3)
    if (esAdminOperativo) return rolObjetivo === 3;
    return false;
  };

  const abrirModalCrear = () => {
    setUsuarioAEditar(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (u) => {
    if (!puedeGestionarUsuario(u)) return;
    if (!u.estado) {
      Swal.fire({
        icon: "warning",
        iconColor: "#5e059e",
        title: "Usuario suspendido",
        text: "Activa el usuario antes de modificar su perfil.",
        confirmButtonColor: "#5e059e",
      });
      return;
    }
    setUsuarioAEditar(u);
    setModalAbierto(true);
  };

  const handleGuardar = async (datos) => {
    if (!usuarioAEditar) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
      if (!passwordRegex.test(datos.password)) {
        Swal.fire({
          icon: "warning",
          iconColor: "#5e059e",
          title: "Contraseña insegura",
          text: "La contraseña debe tener al menos 6 caracteres, una letra mayúscula, una minúscula y un número.",
          confirmButtonColor: "#5e059e",
        });
        return;
      }
    }

    try {
      if (usuarioAEditar) {
        await actualizarUsuario(usuarioAEditar.id_usuario, {
          nombre: datos.nombre,
          correo: datos.correo,
          telefono: datos.telefono,
          id_rol: esPropietario ? datos.id_rol : usuarioAEditar.id_rol,
        });
        Swal.fire({
          icon: "success",
          iconColor: "#5e059e",
          title: "¡Perfil actualizado!",
          text: "Los cambios del usuario se guardaron correctamente.",
          confirmButtonColor: "#5e059e",
        });
      } else {
        await crearUsuario({
          nombre: datos.nombre,
          correo: datos.correo,
          telefono: datos.telefono,
          password: datos.password,
          id_rol: esPropietario ? datos.id_rol : 3,
          id_empresa: usuarioActual.id_empresa,
        });
        Swal.fire({
          icon: "success",
          iconColor: "#5e059e",
          title: "¡Usuario creado!",
          text: "El nuevo integrante ha sido registrado con éxito.",
          confirmButtonColor: "#5e059e",
        });
      }

      setModalAbierto(false);
      setUsuarioAEditar(null);
      await cargarUsuarios(false, true);
    } catch (error) {
      Swal.fire({
        icon: "error",
        iconColor: "#5e059e",
        title:
          error.response?.status === 403
            ? "Acción no autorizada"
            : "Error al guardar",
        text:
          error.response?.data?.error ||
          "No se pudo completar la operación.",
        confirmButtonColor: "#5e059e",
      });
    }
  };

  const handleCambiarEstado = async (u) => {
    if (!puedeGestionarUsuario(u)) return;

    const accion = u.estado ? "desactivar" : "activar";
    const resultado = await Swal.fire({
      icon: u.estado ? "warning" : "question",
      title: `¿Deseas ${accion} este usuario?`,
      text: u.estado
        ? "El usuario quedará suspendido y no podrá iniciar sesión ni editar su perfil hasta ser reactivado."
        : "El usuario recuperará el acceso a StockVelia.",
      showCancelButton: true,
      confirmButtonText: u.estado ? "Sí, desactivar" : "Sí, activar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#6818a5",
      cancelButtonColor: "#d33",
      reverseButtons: true,
    });

    if (!resultado.isConfirmed) return;

    try {
      await cambiarEstadoUsuario(u.id_usuario, !u.estado);
      await cargarUsuarios(false, true);
      Swal.fire({
        icon: "success",
        iconColor: "#5e059e",
        title: u.estado ? "Usuario suspendido" : "Usuario activado",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        iconColor: "#5e059e",
        title: "Error",
        text:
          error.response?.data?.error ||
          "No se pudo cambiar el estado del usuario.",
        confirmButtonColor: "#5e059e",
      });
    }
  };

  const handleBajaDefinitiva = async (u) => {
    if (!puedeGestionarUsuario(u)) return;

    const resultado = await Swal.fire({
      icon: "warning",
      title: "¿Dar de baja definitiva?",
      text: `El usuario "${u.nombre}" pasará a estado Eliminado, perderá acceso permanentemente y se ocultará de los listados, preservando su historial de auditoría.`,
      showCancelButton: true,
      confirmButtonText: "Sí, dar de baja",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
    });

    if (!resultado.isConfirmed) return;

    try {
      await eliminarUsuarioLogico(u.id_usuario);
      await cargarUsuarios(false, true);
      Swal.fire({
        icon: "success",
        iconColor: "#5e059e",
        title: "Baja procesada",
        text: "El usuario fue dado de baja lógica conservando la trazabilidad histórica.",
        confirmButtonColor: "#5e059e",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        iconColor: "#5e059e",
        title: "Error",
        text:
          error.response?.data?.error ||
          "No se pudo procesar la baja lógica del usuario.",
        confirmButtonColor: "#5e059e",
      });
    }
  };

  return (
    <div className="usuarios-container">
      <div className="usuarios-header-top">
        <h2>Gestión de Usuarios</h2>
        <button className="btn-toggle-form" onClick={abrirModalCrear}>
          + Nuevo usuario
        </button>
      </div>

      <div className="table-responsive">
        <table className="tabla-usuarios">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando && usuarios.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                  Cargando usuarios...
                </td>
              </tr>
            ) : usuarios.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                  No hay usuarios registrados en esta empresa.
                </td>
              </tr>
            ) : (
              usuarios.map((u) => {
                const gestionable = puedeGestionarUsuario(u);
                return (
                  <tr key={u.id_usuario}>
                    <td>{u.nombre}</td>
                    <td>{u.correo}</td>
                    <td>{u.telefono || "—"}</td>
                    <td>{obtenerNombreRol(u.id_rol)}</td>
                    <td>
                      <span
                        className={
                          u.estado
                            ? "badge-estado activo"
                            : "badge-estado inactivo"
                        }
                      >
                        <span className="punto-estado"></span>
                        {u.estado ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td>
                      {gestionable ? (
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          <button
                            type="button"
                            className="btn-accion"
                            onClick={() => abrirModalEditar(u)}
                            disabled={!u.estado}
                            title={
                              u.estado
                                ? "Editar datos o rol"
                                : "Activa el usuario para editar"
                            }
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className={
                              u.estado
                                ? "btn-accion desactivar"
                                : "btn-accion activar"
                            }
                            onClick={() => handleCambiarEstado(u)}
                          >
                            {u.estado ? "Desactivar" : "Activar"}
                          </button>
                          <button
                            type="button"
                            className="btn-accion desactivar"
                            style={{ backgroundColor: "#fee2e2", color: "#b91c1c" }}
                            onClick={() => handleBajaDefinitiva(u)}
                          >
                            Baja
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: "#9ca3af", fontSize: "0.82rem" }}>
                          Sin acciones permitidas
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ModalUsuario
        isOpen={modalAbierto}
        onClose={() => {
          setModalAbierto(false);
          setUsuarioAEditar(null);
        }}
        onGuardar={handleGuardar}
        usuarioAEditar={usuarioAEditar}
        esPropietario={esPropietario}
      />
    </div>
  );
}

export default Usuarios;