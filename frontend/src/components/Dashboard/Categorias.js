import React, { useEffect, useState, useCallback } from "react";
import { obtenerCategorias, crearCategoria, actualizarCategoria, eliminarCategoria } from "../../services/categoriaService";
import ModalCategoria from "./modales/ModalCategoria";
import "../../styles/Categorias.css";
import Swal from "sweetalert2";

function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [categoriaAEditar, setCategoriaAEditar] = useState(null);

  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const esAdmin = usuario?.id_rol === 1;

  const cargarCategorias = useCallback(async () => {
    try {
      if (!usuario?.id_empresa) return;
      const data = await obtenerCategorias(usuario.id_empresa);
      setCategorias(data);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    }
  }, [usuario?.id_empresa]);

  useEffect(() => {
    cargarCategorias();
  }, [cargarCategorias]);

  const abrirModalCrear = () => {
    setCategoriaAEditar(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (cat) => {
    setCategoriaAEditar(cat);
    setModalAbierto(true);
  };

  const handleGuardarCategoria = async ({ nombre, descripcion, id_categoria }) => {
    try {
      const usuarioLogueado = JSON.parse(localStorage.getItem("usuario"));

      if (id_categoria) {
        await actualizarCategoria(id_categoria, {
          nombre,
          descripcion,
          id_empresa: usuarioLogueado.id_empresa,
        });

        Swal.fire({
          icon: "success",
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
          title: "¡Categoría creada!",
          text: "La categoría se ha registrado con éxito.",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#5e059e",
        });
      }

      cargarCategorias();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Ops...",
        text: error.response?.data?.error || "No se pudo completar la operación.",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#5e059e",
      });
    }
  };

  const handleEliminar = async (id_categoria) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer. Si hay productos vinculados, la operación podría fallar.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#5e059e",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await eliminarCategoria(id_categoria);
          cargarCategorias();
          Swal.fire({
            icon: "success",
            title: "¡Eliminado!",
            text: "La categoría ha sido eliminada.",
            confirmButtonColor: "#5e059e",
          });
        } catch (error) {
          Swal.fire({
            icon: "error",
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
        {esAdmin && (
          <button 
            className="btn-toggle-form" 
            onClick={abrirModalCrear}
          >
            + Nueva categoría
          </button>
        )}
      </div>

      <div className="categorias-cards-container">
        {categorias.length === 0 ? (
          <div className="categorias-vacio">
            <p>No hay categorías registradas todavía. ¡Crea la primera con el botón superior!</p>
          </div>
        ) : (
          <div className="categorias-grid">
            {categorias.map((cat) => (
              <div className="categoria-card" key={cat.id_categoria}>
                <div className="categoria-info">
                  <h3>{cat.nombre}</h3>
                  <p className="categoria-desc">{cat.descripcion || "Sin descripción"}</p>
                  <div className="categoria-footer">
                    <div style={{ display: "flex", gap: "6px", width: "100%", justifyContent: "flex-end" }}>
                      {esAdmin && (
                        <>
                          <button 
                            className="btn-action" 
                            onClick={() => abrirModalEditar(cat)}
                          >
                            Editar
                          </button>
                          <button 
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
        onClose={() => setModalAbierto(false)}
        categoriaAEditar={categoriaAEditar}
        onCategoriaExitososa={handleGuardarCategoria}
      />
    </div>
  );
}

export default Categorias;