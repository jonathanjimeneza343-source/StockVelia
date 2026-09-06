import React, { useState, useEffect, useCallback } from "react";
import { IconArrowUpRight, IconArrowDownLeft, IconSearch, IconPlus } from "@tabler/icons-react";
import ModalMovimiento from "./ModalMovimiento";
import "../../styles/Movimientos.css";

function Movimientos() {
  const [movimientos, setMovimientos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);

  const token = localStorage.getItem("token");

  const cargarMovimientos = useCallback(async () => {
    try {
      const respuesta = await fetch("http://localhost:5000/api/movimientos", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!respuesta.ok) throw new Error("Error al obtener el historial de movimientos");
      const datos = await respuesta.json();
      setMovimientos(datos);
    } catch (error) {
      console.error(error);
      setMovimientos([]);
    } finally {
      setCargando(false);
    }
  }, [token]);

  useEffect(() => {
    cargarMovimientos();
  }, [cargarMovimientos]);

  const movimientosFiltrados = movimientos.filter((m) =>
    m.nombre_producto?.toLowerCase().includes(busqueda.toLowerCase()) ||
    m.motivo?.toLowerCase().includes(busqueda.toLowerCase())
  );

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
              placeholder="Buscar por producto o motivo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          
          <button 
            className="btn-guardar" 
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 16px" }}
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
          <p className="cargando-texto">No se encontraron movimientos registrados.</p>
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
                const esEntrada = m.tipo_movimiento?.toLowerCase() === "entrada";
                return (
                  <tr key={m.id_movimiento}>
                    <td>
                      <span className={`badge-tipo ${esEntrada ? "entrada" : "salida"}`}>
                        {esEntrada ? <IconArrowDownLeft size={16} /> : <IconArrowUpRight size={16} />}
                        {m.tipo_movimiento}
                      </span>
                    </td>
                    <td className="font-weight-600">{m.nombre_producto}</td>
                    <td>{m.motivo}</td>
                    <td>{m.cantidad} un.</td>
                    <td>{m.nombre_usuario}</td>
                    <td className="texto-observacion">{m.observacion || "Sin observaciones"}</td>
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
        onMovimientoExitoso={cargarMovimientos} 
      />
    </div>
  );
}

export default Movimientos;