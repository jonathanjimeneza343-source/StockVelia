import React, { useEffect, useState, useCallback, useMemo } from "react";
import { obtenerProductos } from "../../services/productoService";
import { obtenerCategorias } from "../../services/categoriaService";
import "../../styles/inicioDashboard.css";

// Caché sencilla en memoria por empresa para evitar parpadeos al cambiar de pestaña
const cacheDashboardPorEmpresa = new Map();

function InicioDashboard() {
  const usuario = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("usuario")) || {};
    } catch {
      return {};
    }
  }, []);

  const idEmpresa = usuario?.id_empresa;
  const cacheInicial = idEmpresa ? cacheDashboardPorEmpresa.get(idEmpresa) : null;

  const [stats, setStats] = useState(
    cacheInicial?.stats || {
      totalProductos: 0,
      totalCategorias: 0,
      stockBajo: 0,
      valorInventario: 0,
    }
  );
  const [productosBajos, setProductosBajos] = useState(
    cacheInicial?.productosBajos || []
  );
  const [cargando, setCargando] = useState(!cacheInicial);

  const cargarResumen = useCallback(
    async (silencioso = false) => {
      try {
        if (!idEmpresa) {
          setCargando(false);
          return;
        }

        const tieneCache = cacheDashboardPorEmpresa.has(idEmpresa);
        if (!silencioso && !tieneCache) {
          setCargando(true);
        }

        const [productosRes, categoriasRes] = await Promise.all([
          obtenerProductos(),
          obtenerCategorias(),
        ]);

        const productos = (Array.isArray(productosRes) ? productosRes : []).filter(
          (p) =>
            p.estado !== false &&
            String(p.estado_producto || p.estado || "").toLowerCase() !== "inactivo" &&
            String(p.estado_producto || p.estado || "").toLowerCase() !== "eliminado"
        );
        const categorias = Array.isArray(categoriasRes) ? categoriasRes : [];

        const filtradosBajos = productos.filter(
          (p) => Number(p.stock ?? 0) <= Number(p.stock_minimo ?? 5)
        );

        const valorTotal = productos.reduce(
          (acc, p) => acc + Number(p.precio || 0) * Number(p.stock || 0),
          0
        );

        const nuevasStats = {
          totalProductos: productos.length,
          totalCategorias: categorias.length,
          stockBajo: filtradosBajos.length,
          valorInventario: valorTotal,
        };

        setStats(nuevasStats);
        setProductosBajos(filtradosBajos);

        cacheDashboardPorEmpresa.set(idEmpresa, {
          stats: nuevasStats,
          productosBajos: filtradosBajos,
        });
      } catch (error) {
        if (!silencioso) {
          console.error("Error al cargar el resumen del dashboard:", error);
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
    const ejecutar = async (esSilencioso) => {
      if (!activo) return;
      await cargarResumen(esSilencioso);
    };

    ejecutar(false);
    const intervalo = setInterval(() => {
      ejecutar(true);
    }, 30000);

    return () => {
      activo = false;
      clearInterval(intervalo);
    };
  }, [cargarResumen]);

  const formatoMoneda = (valor) => `$${Number(valor || 0).toLocaleString()}`;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header-top">
        <div>
          <h2>Panel Principal</h2>
          <p className="dashboard-welcome">
            Bienvenido de nuevo,{" "}
            <strong>{usuario?.nombre || "Usuario"}</strong>. Aquí tienes el estado
            actual de tu inventario.
          </p>
        </div>
      </div>

      <div className="dashboard-cards-grid">
        <div className="dash-card card-purple">
          <div className="dash-card-info">
            <span className="dash-card-title">Productos Totales</span>
            <p className="dash-card-number">
              {cargando ? "..." : stats.totalProductos}
            </p>
          </div>
          <div className="dash-icon-box purple-box">📦</div>
        </div>

        <div className="dash-card card-blue">
          <div className="dash-card-info">
            <span className="dash-card-title">Categorías</span>
            <p className="dash-card-number">
              {cargando ? "..." : stats.totalCategorias}
            </p>
          </div>
          <div className="dash-icon-box blue-box">🏷️</div>
        </div>

        <div className="dash-card card-amber">
          <div className="dash-card-info">
            <span className="dash-card-title">Stock Bajo / Crítico</span>
            <p className="dash-card-number low">
              {cargando ? "..." : stats.stockBajo}
            </p>
          </div>
          <div className="dash-icon-box amber-box">⚠️</div>
        </div>

        <div className="dash-card card-emerald">
          <div className="dash-card-info">
            <span className="dash-card-title">Valor del Inventario</span>
            <p className="dash-card-number">
              {cargando ? "..." : formatoMoneda(stats.valorInventario)}
            </p>
          </div>
          <div className="dash-icon-box emerald-box">💰</div>
        </div>
      </div>

      <div className="dashboard-section">
        <h3 className="section-title">🔔 Alertas de Stock Crítico</h3>
        {cargando && productosBajos.length === 0 ? (
          <div className="dashboard-empty">
            <p>Cargando alertas de stock...</p>
          </div>
        ) : productosBajos.length === 0 ? (
          <div className="dashboard-empty">
            <span className="empty-icon">✅</span>
            <p>
              ¡Excelente! No hay productos por debajo o en su stock mínimo en
              este momento.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Producto</th>
                  <th>Stock Actual</th>
                  <th>Mínimo</th>
                  <th>Precio</th>
                </tr>
              </thead>
              <tbody>
                {productosBajos.map((p) => (
                  <tr key={p.id_producto}>
                    <td>{p.codigo}</td>
                    <td className="font-weight-medium">{p.nombre}</td>
                    <td>
                      <span className="badge-low">{p.stock} unidades</span>
                    </td>
                    <td>{p.stock_minimo ?? 5} un.</td>
                    <td>{formatoMoneda(p.precio)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default InicioDashboard;