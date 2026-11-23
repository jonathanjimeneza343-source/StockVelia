import React, { useState, useEffect } from "react";
import { IconX } from "@tabler/icons-react";
import Swal from "sweetalert2";
import api from "../../../services/api";
import { obtenerProductos } from "../../../services/productoService";
import "../../../styles/ModalMovimiento.css";

const ESTADO_INICIAL = {
  id_producto: "",
  tipo_movimiento: "Entrada",
  motivo: "Compra",
  cantidad: "",
  observacion: "",
};

const MOTIVOS_SUGERIDOS = {
  Entrada: ["Compra a proveedor", "Devolución de cliente"],
  Salida: ["Venta", "Baja / Daño", "Ajuste de inventario"],
  Venta: ["Venta directa"],
  Baja: ["Baja / Daño", "Producto vencido / obsoleto"],
};

function ModalMovimiento({ isOpen, onClose, onMovimientoExitoso }) {
  const [productos, setProductos] = useState([]);
  const [formData, setFormData] = useState(ESTADO_INICIAL);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setFormData(ESTADO_INICIAL);
      obtenerProductos()
        .then((data) => setProductos(Array.isArray(data) ? data : []))
        .catch((err) => {
          console.error("Error al cargar productos:", err);
          setProductos([]);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const productoSeleccionado = productos.find(
    (p) => Number(p.id_producto) === Number(formData.id_producto)
  );

  const esOperacionSalida = ["Salida", "Venta", "Baja"].includes(
    formData.tipo_movimiento
  );

  const esBajaODano =
    formData.tipo_movimiento === "Baja" ||
    /baja|dañ|merma|vencid|obsolet/i.test(formData.motivo || "");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === "tipo_movimiento") {
        const opciones = MOTIVOS_SUGERIDOS[value] || [];
        return {
          ...prev,
          tipo_movimiento: value,
          motivo: opciones[0] || "",
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const cantidadNum = Number(formData.cantidad);
    const motivoLimpio = formData.motivo.trim();
    const observacionLimpia = formData.observacion.trim();

    if (!formData.id_producto || !motivoLimpio || cantidadNum <= 0 || Number.isNaN(cantidadNum)) {
      setError(
        "Debes seleccionar un producto, indicar un motivo válido y una cantidad mayor a 0."
      );
      return;
    }

    if (esOperacionSalida && productoSeleccionado) {
      const stockActual = Number(productoSeleccionado.stock ?? 0);
      if (cantidadNum > stockActual) {
        setError(
          `Stock Insuficiente: solo hay ${stockActual} unidades disponibles de "${productoSeleccionado.nombre}".`
        );
        return;
      }
    }

    if (esBajaODano && !observacionLimpia) {
      setError(
        "Debes ingresar la justificación u observación para registrar una Baja o Daño."
      );
      return;
    }

    setCargando(true);
    try {
      const respuesta = await api.post("/movimientos", {
        ...formData,
        motivo: motivoLimpio,
        observacion: observacionLimpia,
        cantidad: Math.floor(cantidadNum),
      });

      const resultado = respuesta.data;
      Swal.fire({
        icon: "success",
        iconColor: "#5e059e",
        title: "¡Movimiento registrado!",
        showConfirmButton: false,
        timer: 1400,
      });

      if (resultado?.stock_bajo) {
        Swal.fire({
          toast: true,
          position: "bottom-end",
          icon: "warning",
          iconColor: "#5e059e",
          title: "¡Atención: Stock Bajo!",
          text: `El producto ha quedado con un stock crítico de ${resultado.stock_actual} unidades.`,
          showConfirmButton: false,
          timer: 4000,
          timerProgressBar: true,
        });
      }

      setFormData(ESTADO_INICIAL);
      if (onMovimientoExitoso) {
        await onMovimientoExitoso();
      }
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.message ||
        "Error al procesar el movimiento"
      );
    } finally {
      setCargando(false);
    }
  };

  const sugerencias = MOTIVOS_SUGERIDOS[formData.tipo_movimiento] || [];

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Registrar Movimiento de Inventario</h3>
          <button type="button" className="btn-cerrar" onClick={onClose}>
            <IconX size={20} />
          </button>
        </div>

        {error && <div className="error-mensaje">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Producto</label>
            <select
              name="id_producto"
              value={formData.id_producto}
              onChange={handleChange}
              required
            >
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
            <select
              name="tipo_movimiento"
              value={formData.tipo_movimiento}
              onChange={handleChange}
            >
              <option value="Entrada">Entrada (Compra / Devolución)</option>
              <option value="Salida">Salida</option>
              <option value="Venta">Venta</option>
              <option value="Baja">Baja / Daño</option>
            </select>
          </div>

          <div className="form-group">
            <label>Motivo</label>
            <input
              type="text"
              name="motivo"
              list="motivos-sugeridos-list"
              placeholder="Ej. Compra a proveedor, Devolución..."
              value={formData.motivo}
              onChange={handleChange}
              required
            />
            <datalist id="motivos-sugeridos-list">
              {sugerencias.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </div>

          <div className="form-group">
            <label>Cantidad</label>
            <input
              type="number"
              name="cantidad"
              min="1"
              step="1"
              placeholder="Ej. 10"
              value={formData.cantidad}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>
              {esBajaODano
                ? "Justificación de Baja / Daño (Obligatoria)"
                : "Observación (Opcional)"}
            </label>
            <textarea
              name="observacion"
              rows="2"
              placeholder={
                esBajaODano
                  ? "Describe el motivo de la baja o daño..."
                  : "Detalles adicionales..."
              }
              value={formData.observacion}
              onChange={handleChange}
              required={esBajaODano}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancelar" onClick={onClose}>
              Cancelar
            </button>
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