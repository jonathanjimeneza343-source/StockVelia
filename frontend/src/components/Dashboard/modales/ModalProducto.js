import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "../../../styles/ModalProducto.css";

function ModalProducto({
  isOpen,
  onClose,
  onGuardar,
  productoAEditar,
  categorias,
}) {
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [idCategoria, setIdCategoria] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagen, setImagen] = useState("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("");
  const [stockMinimo, setStockMinimo] = useState("5");

  useEffect(() => {
    if (isOpen) {
      if (productoAEditar) {
        setCodigo(productoAEditar.codigo || "");
        setNombre(productoAEditar.nombre || "");
        setIdCategoria(productoAEditar.id_categoria ?? "");
        setDescripcion(productoAEditar.descripcion || "");
        setImagen(productoAEditar.imagen || "");
        setPrecio(productoAEditar.precio ?? "");
        setStock(productoAEditar.stock ?? "");
        setStockMinimo(productoAEditar.stock_minimo ?? 5);
      } else {
        setCodigo("");
        setNombre("");
        setIdCategoria("");
        setDescripcion("");
        setImagen("");
        setPrecio("");
        setStock("");
        setStockMinimo("5");
      }
    }
  }, [productoAEditar, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const codigoLimpio = codigo.trim();
    const nombreLimpio = nombre.trim();
    const categoriaNum = parseInt(idCategoria, 10);
    const precioNum = Number(precio);
    const stockNum = Number(stock);
    const stockMinNum = Number(stockMinimo);

    if (
      !codigoLimpio ||
      !nombreLimpio ||
      Number.isNaN(categoriaNum) ||
      precio === "" ||
      stock === "" ||
      stockMinimo === ""
    ) {
      Swal.fire({
        icon: "warning",
        iconColor: "#5e059e",
        title: "Campos incompletos",
        text: "Completa código, nombre, categoría, precio, stock y stock mínimo.",
        confirmButtonColor: "#5e059e",
      });
      return;
    }

    if (
      Number.isNaN(precioNum) ||
      Number.isNaN(stockNum) ||
      Number.isNaN(stockMinNum) ||
      precioNum < 0 ||
      stockNum < 0 ||
      stockMinNum < 0
    ) {
      Swal.fire({
        icon: "error",
        iconColor: "#5e059e",
        title: "Valores inválidos",
        text: "El precio, el stock y el stock mínimo deben ser valores numéricos mayores o iguales a cero (>= 0).",
        confirmButtonColor: "#5e059e",
      });
      return;
    }

    onGuardar({
      codigo: codigoLimpio,
      nombre: nombreLimpio,
      id_categoria: categoriaNum,
      descripcion: descripcion.trim(),
      imagen: imagen.trim(),
      precio: precioNum,
      stock: Math.floor(stockNum),
      stock_minimo: Math.floor(stockMinNum),
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-fade">
        <div className="modal-header">
          <h3>{productoAEditar ? "Editar Producto" : "Nuevo Producto"}</h3>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-grupo-input">
            <label>Código / Código de barras</label>
            <input
              type="text"
              placeholder="Ej. PRD-001"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              required
            />
          </div>

          <div className="modal-grupo-input">
            <label>Nombre del producto</label>
            <input
              type="text"
              placeholder="Ej. Camiseta Deportiva"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div className="modal-grupo-input">
            <label>Categoría</label>
            <select
              value={idCategoria}
              onChange={(e) => setIdCategoria(e.target.value)}
              required
            >
              <option value="">Selecciona una categoría</option>
              {categorias.map((cat) => (
                <option key={cat.id_categoria} value={cat.id_categoria}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-grupo-input">
            <label>Descripción (Opcional)</label>
            <input
              type="text"
              placeholder="Detalles del producto"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          <div className="modal-grupo-input">
            <label>URL de la imagen (Opcional)</label>
            <input
              type="url"
              placeholder="https://..."
              value={imagen}
              onChange={(e) => setImagen(e.target.value)}
            />
          </div>

          <div className="modal-fila-doble">
            <div className="modal-grupo-input">
              <label>Precio ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                required
              />
            </div>

            <div className="modal-grupo-input">
              <label>Stock inicial</label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="modal-grupo-input">
            <label>Stock mínimo de alerta</label>
            <input
              type="number"
              min="0"
              step="1"
              placeholder="Ej. 5"
              value={stockMinimo}
              onChange={(e) => setStockMinimo(e.target.value)}
              required
            />
          </div>

          <div className="modal-botones">
            <button type="button" className="btn-cancelar" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-guardar">
              {productoAEditar ? "Guardar cambios" : "Registrar producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalProducto;