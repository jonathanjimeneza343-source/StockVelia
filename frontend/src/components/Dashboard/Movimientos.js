import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  IconArrowUpRight,
  IconArrowDownLeft,
  IconSearch,
  IconPlus,
} from "@tabler/icons-react";
import api from "../../services/api";
import ModalMovimiento from "./modales/ModalMovimiento";
import "../../styles/Movimientos.css";

const cacheMovimientosPorEmpresa = new Map();
const peticionesMovimientosEnCurso = new Map();

function obtenerUsuarioGuardado() {
  try {
    return JSON.parse(localStorage.getItem("usuario")) || {};
  } catch {
    return {};
  }
}

function Movimientos() {
  const usuario = useMemo(() => obtenerUsuarioGuardado(), []);
  const idEmpresa = usuario?.id_empresa;
  const cacheInicial = idEmpresa ? cacheMovimientosPorEmpresa.get(idEmpresa) : null;

  const [movimientos, setMovimientos] = useState(
    Array.isArray(cacheInicial) ? cacheInicial : []
  );
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(!cacheInicial);
  const [modalAbierto, setModalAbierto] = useState(false);

  const cargarMovimientos = useCallback(
    async (silencioso = false, forzarRed = false) => {
      if (!idEmpresa) {
        setCargando(false);
        return;
      }

      const tieneCache = cacheMovimientosPorEmpresa.has(idEmpresa);
      if (!silencioso && !tieneCache) {
        setCargando(true);
      }

      try {
        let promesa = peticionesMovimientosEnCurso.get(idEmpresa);
        if (!promesa || forzarRed) {
          promesa = api
            .get("/movimientos")
            .then((res) => (Array.isArray(res.data) ? res.data : []))
            .finally(() => {
              peticionesMovimientosEnCurso.delete(idEmpresa);
            });
          peticionesMovimientosEnCurso.set(idEmpresa, promesa);
        }

        const lista = await promesa;
        cacheMovimientosPorEmpresa.set(idEmpresa, lista);
        setMovimientos(lista);
      } catch (error) {
        if (!silencioso) {
          console.error("Error al obtener el historial de movimientos:", error);
          if (!tieneCache) {
            setMovimientos([]);
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

    const ejecutarCarga = async (esSilencioso, forzar = false) => {
      if (!activo) return;
      await cargarMovimientos(esSilencioso, forzar);
    };

    ejecutarCarga(false, false);
    const intervalo = setInterval(() => {
      ejecutarCarga(true, true);
    }, 30000);

    return () => {
      activo = false;
      clearInterval(intervalo);
    };
  }, [cargarMovimientos]);

  const movimientosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return movimientos;
    return movimientos.filter(
      (m) =>
        m.nombre_producto?.toLowerCase().includes(q) ||
        m.motivo?.toLowerCase().includes(q) ||
        m.nombre_usuario?.toLowerCase().includes(q)
    );
  }, [movimientos, busqueda]);

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
        {cargando && movimientos.length === 0 ? (
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
                        className={`badge-tipo ${esEntrada ? "entrada" : "salida"}`}
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
        onMovimientoExitoso={() => cargarMovimientos(false, true)}
      />
    </div>
  );
}

export default Movimientos;