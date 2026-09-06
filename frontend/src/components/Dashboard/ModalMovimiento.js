import React, { useState, useEffect } from "react";
import { IconX } from "@tabler/icons-react";
import "../../styles/ModalMovimiento.css";

function ModalMovimiento({ isOpen, onClose, onMovimientoExitoso }) {
  const [productos, setproductos] = useState([]);
  const [formData, setFormData] = useState({
    id_producto: "",
    tipo_movimiento: "Entrada",
    motivo: "",
    cantidad: "",
    observacion: ""
  });
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (isOpen) {
      fetch("http://localhost:5000/api/productos", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then((data) => setproductos(data))
        .catch((err) => console.error("Error al cargar productos:", err));
    }
  }, [isOpen, token]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      const respuesta = await fetch("http://localhost:5000/api/movimientos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          cantidad: Number(formData.cantidad)
        })
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(resultado.error || "Error al procesar el movimiento");
      }

      setFormData({ id_producto: "", tipo_movimiento: "Entrada", motivo: "", cantidad: "", observacion: "" });
      onMovimientoExitoso();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Registrar Movimiento de Inventario</h3>
          <button className="btn-cerrar" onClick={onClose}><IconX size={20} /></button>
        </div>

        {error && <div className="error-mensaje">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Producto</label>
            <select name="id_producto" value={formData.id_producto} onChange={handleChange} required>
              <option value="">Seleccione un producto...</option>
              {productos.map((p) => (
                <option key={p.id_producto} value={p.id_producto}>
                  {p.nombre} (Stock actual: {p.stock})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Tipo de Movimiento</label>
            <select name="tipo_movimiento" value={formData.tipo_movimiento} onChange={handleChange}>
              <option value="Entrada">Entrada</option>
              <option value="Salida">Salida</option>
              <option value="Venta">Venta</option>
              <option value="Baja">Baja / Merma</option>
            </select>
          </div>

          <div className="form-group">
            <label>Motivo</label>
            <input 
              type="text" 
              name="motivo" 
              placeholder="Ej. Compra a proveedor, Devolución..." 
              value={formData.motivo} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Cantidad</label>
            <input 
              type="number" 
              name="cantidad" 
              min="1" 
              placeholder="Ej. 10" 
              value={formData.cantidad} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Observación (Opcional)</label>
            <textarea 
              name="observacion" 
              rows="2" 
              placeholder="Detalles adicionales..." 
              value={formData.observacion} 
              onChange={handleChange} 
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancelar" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-guardar" disabled={cargando}>
              {cargando ? "Guardando..." : "Registrar Movimiento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalMovimiento;