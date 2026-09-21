import React, { useState, useEffect } from "react";
import { IconX } from "@tabler/icons-react";
import "../../../styles/ModalCategoria.css";

function ModalCategoria({ isOpen, onClose, categoriaAEditar, onCategoriaExitososa }) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (categoriaAEditar) {
      setNombre(categoriaAEditar.nombre || "");
      setDescripcion(categoriaAEditar.descripcion || "");
    } else {
      setNombre("");
      setDescripcion("");
    }
  }, [categoriaAEditar, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);

    try {
      onCategoriaExitososa({
        nombre,
        descripcion,
        id_categoria: categoriaAEditar ? categoriaAEditar.id_categoria : null
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{categoriaAEditar ? "Editar Categoría" : "Nueva Categoría"}</h3>
          <button className="btn-cerrar" onClick={onClose}><IconX size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre de la categoría</label>
            <input 
              type="text" 
              placeholder="Ej. Medicamentos, Aseo..." 
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Descripción (Opcional)</label>
            <textarea 
              rows="3" 
              placeholder="Detalles adicionales..." 
              value={descripcion} 
              onChange={(e) => setDescripcion(e.target.value)} 
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancelar" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-guardar" disabled={cargando}>
              {cargando ? "Guardando..." : categoriaAEditar ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalCategoria;