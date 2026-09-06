import React, { useEffect, useState, useCallback } from "react";
import { obtenerCategorias, crearCategoria, actualizarCategoria, eliminarCategoria } from "../../services/categoriaService";
import "../../styles/Categorias.css";
import Swal from "sweetalert2";

function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [idCategoriaEditando, setIdCategoriaEditando] = useState(null);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const esAdmin = usuario?.id_rol === 1;

  const cargarCategorias = useCallback(async () => {
    try {
      const data = await obtenerCategorias(usuario.id_empresa);
      setCategorias(data);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    }
  }, [usuario?.id_empresa]);

  useEffect(() => {
    cargarCategorias();
  }, [cargarCategorias]);

  const abrirFormularioCreacion = () => {
    setIdCategoriaEditando(null);
    setNombre("");
    setDescripcion("");
    setMostrarForm(!mostrarForm);
  };

  const iniciarEdicion = (cat) => {
    setIdCategoriaEditando(cat.id_categoria);
    setNombre(cat.nombre);
    setDescripcion(cat.descripcion || "");
    setMostrarForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    try {
      const usuarioLogueado = JSON.parse(localStorage.getItem("usuario"));

      if (idCategoriaEditando) {
        await actualizarCategoria(idCategoriaEditando, {
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

      setNombre("");
      setDescripcion("");
      setIdCategoriaEditando(null);
      setMostrarForm(false);
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
            onClick={abrirFormularioCreacion}
          >
            {mostrarForm ? "Cancelar" : "+ Nueva categoría"}
          </button>
        )}
      </div>

      {esAdmin && mostrarForm && (
        <form className="categorias-form animate-fade" onSubmit={handleGuardar}>
          <input
            className="categorias-input"
            type="text"
            placeholder="Nombre de la categoría"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          <input
            className="categorias-input"
            type="text"
            placeholder="Descripción (opcional)"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
          <button type="submit" className="btn-submit">
            {idCategoriaEditando ? "Actualizar categoría" : "Guardar categoría"}
          </button>
        </form>
      )}

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
                    <span className="categoria-id">ID: {cat.id_categoria}</span>
                    <div style={{ display: "flex", gap: "6px" }}>
                      {esAdmin && (
                        <>
                          <button 
                            className="btn-action" 
                            onClick={() => iniciarEdicion(cat)}
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
    </div>
  );
}

export default Categorias;