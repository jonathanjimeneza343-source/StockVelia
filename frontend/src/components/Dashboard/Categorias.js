import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  obtenerCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
} from "../../services/categoriaService";
import ModalCategoria from "./modales/ModalCategoria";
import "../../styles/Categorias.css";
import Swal from "sweetalert2";

const cacheCategoriasPorEmpresa = new Map();
const peticionesCategoriasEnCurso = new Map();

function obtenerUsuarioGuardado() {
  try {
    return JSON.parse(localStorage.getItem("usuario")) || {};
  } catch {
    return {};
  }
}

function Categorias() {
  const usuario = useMemo(() => obtenerUsuarioGuardado(), []);
  const idEmpresa = usuario?.id_empresa;
  const cacheInicial = idEmpresa ? cacheCategoriasPorEmpresa.get(idEmpresa) : null;

  const [categorias, setCategorias] = useState(
    Array.isArray(cacheInicial) ? cacheInicial : []
  );
  const [cargando, setCargando] = useState(!cacheInicial);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [categoriaAEditar, setCategoriaAEditar] = useState(null);

  const rolNumero = Number(usuario?.id_rol);
  const esAdmin = rolNumero === 1 || rolNumero === 2;
  const puedeCrearCategoria = [1, 2, 3].includes(rolNumero);

  const cargarCategorias = useCallback(
    async (silencioso = false, forzarRed = false) => {
      if (!idEmpresa) {
        setCargando(false);
        return;
      }

      const tieneCache = cacheCategoriasPorEmpresa.has(idEmpresa);
      if (!silencioso && !tieneCache) {
        setCargando(true);
      }

      try {
        let promesa = peticionesCategoriasEnCurso.get(idEmpresa);
        if (!promesa || forzarRed) {
          promesa = obtenerCategorias()
            .then((data) => (Array.isArray(data) ? data : []))
            .finally(() => {
              peticionesCategoriasEnCurso.delete(idEmpresa);
            });
          peticionesCategoriasEnCurso.set(idEmpresa, promesa);
        }

        const lista = await promesa;
        cacheCategoriasPorEmpresa.set(idEmpresa, lista);
        setCategorias(lista);
      } catch (error) {
        if (!silencioso) {
          console.error("Error al cargar categorías:", error);
          if (!tieneCache) {
            setCategorias([]);
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
      await cargarCategorias(false, false);
    };

    ejecutar();
    return () => {
      activo = false;
    };
  }, [cargarCategorias]);

  const abrirModalCrear = () => {
    if (!puedeCrearCategoria) return;
    setCategoriaAEditar(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (cat) => {
    if (!esAdmin) return;
    setCategoriaAEditar(cat);
    setModalAbierto(true);
  };

  const handleGuardarCategoria = async ({ nombre, descripcion, id_categoria }) => {
    try {
      const usuarioLogueado = obtenerUsuarioGuardado();
      if (id_categoria) {
        if (!esAdmin) {
          Swal.fire({
            icon: "error",
            iconColor: "#5e059e",
            title: "Acceso restringido",
            text: "No tienes permisos para editar categorías.",
            confirmButtonText: "Entendido",
            confirmButtonColor: "#5e059e",
          });
          return;
        }
        await actualizarCategoria(id_categoria, {
          nombre,
          descripcion,
          id_empresa: usuarioLogueado.id_empresa,
        });
        Swal.fire({
          icon: "success",
          iconColor: "#5e059e",
          title: "¡Categoría actualizada!",
          text: "Los cambios se han guardado con éxito.",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#5e059e",
        });
      } else {
        await crearCategoria({
          nombre,
          descripcion,
          id_empresa: usuarioLogueado.id_empresa,
        });
        Swal.fire({
          icon: "success",
          iconColor: "#5e059e",
          title: "¡Categoría creada!",
          text: "La categoría se ha registrado con éxito.",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#5e059e",
        });
      }
      setModalAbierto(false);
      setCategoriaAEditar(null);
      await cargarCategorias(false, true);
    } catch (error) {
      Swal.fire({
        icon: "error",
        iconColor: "#5e059e",
        title: "Ops...",
        text: error.response?.data?.error || "No se pudo completar la operación.",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#5e059e",
      });
    }
  };

  const handleEliminar = (id_categoria) => {
    if (!esAdmin) return;
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer. Si hay productos vinculados, la operación podría fallar.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#5e059e",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await eliminarCategoria(id_categoria);
          await cargarCategorias(false, true);
          Swal.fire({
            icon: "success",
            iconColor: "#5e059e",
            title: "¡Eliminado!",
            text: "La categoría ha sido eliminada.",
            confirmButtonColor: "#5e059e",
          });
        } catch (error) {
          Swal.fire({
            icon: "error",
            iconColor: "#5e059e",
            title: "Error al eliminar",
            text: error.response?.data?.error || "No se pudo eliminar la categoría.",
            confirmButtonText: "Entendido",
            confirmButtonColor: "#5e059e",
          });
        }
      }
    });
  };

  return (
    <div className="categorias-container">
      <div className="categorias-header-top">
        <h2>Gestión de Categorías</h2>
        {puedeCrearCategoria && (
          <button
            type="button"
            className="btn-toggle-form"
            onClick={abrirModalCrear}
          >
            + Nueva categoría
          </button>
        )}
      </div>

      <div className="categorias-cards-container">
        {cargando && categorias.length === 0 ? (
          <div className="categorias-vacio">
            <p>Cargando categorías...</p>
          </div>
        ) : categorias.length === 0 ? (
          <div className="categorias-vacio">
            <p>
              No hay categorías registradas todavía. ¡Crea la primera con el botón
              superior!
            </p>
          </div>
        ) : (
          <div className="categorias-grid">
            {categorias.map((cat) => (
              <div className="categoria-card" key={cat.id_categoria}>
                <div className="categoria-info">
                  <h3>{cat.nombre}</h3>
                  <p className="categoria-desc">
                    {cat.descripcion || "Sin descripción"}
                  </p>
                  <div className="categoria-footer">
                    <div
                      style={{
                        display: "flex",
                        gap: "6px",
                        width: "100%",
                        justifyContent: "flex-end",
                      }}
                    >
                      {esAdmin && (
                        <>
                          <button
                            type="button"
                            className="btn-action"
                            onClick={() => abrirModalEditar(cat)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="btn-action btn-delete"
                            onClick={() => handleEliminar(cat.id_categoria)}
                          >
                            Eliminar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ModalCategoria
        isOpen={modalAbierto}
        onClose={() => {
          setModalAbierto(false);
          setCategoriaAEditar(null);
        }}
        categoriaAEditar={categoriaAEditar}
        onCategoriaExitososa={handleGuardarCategoria}
      />
    </div>
  );
}

export default Categorias;