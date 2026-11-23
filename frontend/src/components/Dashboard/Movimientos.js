import React, { useState, useEffect, useCallback } from "react";
import {
  IconArrowUpRight,
  IconArrowDownLeft,
  IconSearch,
  IconPlus,
} from "@tabler/icons-react";
import api from "../../services/api";
import ModalMovimiento from "./modales/ModalMovimiento";
import "../../styles/Movimientos.css";

function Movimientos() {
  const [movimientos, setMovimientos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);

  const cargarMovimientos = useCallback(async (silencioso = false) => {
    try {
      if (!silencioso) setCargando(true);
      const respuesta = await api.get("/movimientos");
      setMovimientos(Array.isArray(respuesta.data) ? respuesta.data : []);
    } catch (error) {
      if (!silencioso) {
        console.error("Error al obtener el historial de movimientos:", error);
        setMovimientos([]);
      }
    } finally {
      if (!silencioso) setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarMovimientos(false);
    const intervalo = setInterval(() => {
      cargarMovimientos(true);
    }, 15000);
    return () => clearInterval(intervalo);
  }, [cargarMovimientos]);

  const movimientosFiltrados = movimientos.filter((m) => {
    const q = busqueda.toLowerCase();
    return (
      m.nombre_producto?.toLowerCase().includes(q) ||
      m.motivo?.toLowerCase().includes(q) ||
      m.nombre_usuario?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="seccion-contenedor">
      <div className="seccion-header-flex">
        <div>
          <h2>Movimientos de Inventario</h2>
          <p>Historial en tiempo real de entradas, salidas y motivos registrados</p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div className="busqueda-contenedor">
            <IconSearch size={20} className="icono-busqueda" />
            <input
              type="text"
              placeholder="Buscar por producto, motivo o responsable..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="btn-guardar"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 16px",
            }}
            onClick={() => setModalAbierto(true)}
          >
            <IconPlus size={18} /> Nuevo Movimiento
          </button>
        </div>
      </div>

      <div className="tabla-card">
        {cargando ? (
          <p className="cargando-texto">Cargando movimientos...</p>
        ) : movimientosFiltrados.length === 0 ? (
          <p className="cargando-texto">
            No se encontraron movimientos registrados.
          </p>
        ) : (
          <table className="tabla-datos">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Producto</th>
                <th>Motivo</th>
                <th>Cantidad</th>
                <th>Responsable</th>
                <th>Observación</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {movimientosFiltrados.map((m) => {
                const esEntrada =
                  m.tipo_movimiento?.toLowerCase() === "entrada";
                return (
                  <tr key={m.id_movimiento}>
                    <td>
                      <span
                        className={`badge-tipo ${esEntrada ? "entrada" : "salida"
                          }`}
                      >
                        {esEntrada ? (
                          <IconArrowDownLeft size={16} />
                        ) : (
                          <IconArrowUpRight size={16} />
                        )}
                        {m.tipo_movimiento}
                      </span>
                    </td>
                    <td className="font-weight-600">{m.nombre_producto}</td>
                    <td>{m.motivo}</td>
                    <td>{m.cantidad} un.</td>
                    <td>{m.nombre_usuario}</td>
                    <td className="texto-observacion">
                      {m.observacion || "Sin observaciones"}
                    </td>
                    <td>{m.fecha_formateada || "N/A"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <ModalMovimiento
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onMovimientoExitoso={() => cargarMovimientos(false)}
      />
    </div>
  );
}

export default Movimientos;