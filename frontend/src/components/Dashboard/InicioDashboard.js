import React, { useEffect, useState, useCallback } from "react";
import { obtenerProductos } from "../../services/productoService";
import { obtenerCategorias } from "../../services/categoriaService";
import "../../styles/inicioDashboard.css";

function InicioDashboard() {
  const [stats, setStats] = useState({
    totalProductos: 0,
    totalCategorias: 0,
    stockBajo: 0,
    valorInventario: 0,
  });
  const [productosBajos, setProductosBajos] = useState([]);

  const usuario = JSON.parse(localStorage.getItem("usuario"));

  const cargarResumen = useCallback(async () => {
    try {
      const idEmpresa = usuario?.id_empresa;
      if (!idEmpresa) return;

      const [productos, categorias] = await Promise.all([
        obtenerProductos(idEmpresa),
        obtenerCategorias(idEmpresa),
      ]);

      const totalProductos = productos.length;
      const totalCategorias = categorias.length;
      
      const filtradosBajos = productos.filter((p) => p.stock <= 5);
      const valorTotal = productos.reduce((acc, p) => acc + (p.precio * p.stock), 0);

      setStats({
        totalProductos,
        totalCategorias,
        stockBajo: filtradosBajos.length,
        valorInventario: valorTotal,
      });

      setProductosBajos(filtradosBajos);
    } catch (error) {
      console.error("Error al cargar el resumen del dashboard:", error);
    }
  }, [usuario?.id_empresa]);

  useEffect(() => {
    cargarResumen();
  }, [cargarResumen]);

  return (
    <div className="dashboard-container">
      {/* Cabecera del Panel */}
      <div className="dashboard-header-top">
        <div>
          <h2>Panel Principal</h2>
          <p className="dashboard-welcome">
            Bienvenido de nuevo, <strong>{usuario?.nombre || "Administrador"}</strong>. Aquí tienes el estado actual de tu inventario.
          </p>
        </div>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="dashboard-cards-grid">
        <div className="dash-card card-purple">
          <div className="dash-card-info">
            <span className="dash-card-title">Productos Totales</span>
            <p className="dash-card-number">{stats.totalProductos}</p>
          </div>
          <div className="dash-icon-box purple-box">📦</div>
        </div>

        <div className="dash-card card-blue">
          <div className="dash-card-info">
            <span className="dash-card-title">Categorías</span>
            <p className="dash-card-number">{stats.totalCategorias}</p>
          </div>
          <div className="dash-icon-box blue-box">🏷️</div>
        </div>

        <div className="dash-card card-amber">
          <div className="dash-card-info">
            <span className="dash-card-title">Stock Bajo (≤ 5)</span>
            <p className="dash-card-number low">{stats.stockBajo}</p>
          </div>
          <div className="dash-icon-box amber-box">⚠️</div>
        </div>

        <div className="dash-card card-emerald">
          <div className="dash-card-info">
            <span className="dash-card-title">Valor del Inventario</span>
            <p className="dash-card-number">${stats.valorInventario.toLocaleString()}</p>
          </div>
          <div className="dash-icon-box emerald-box">💰</div>
        </div>
      </div>

      {/* Sección de Alertas */}
      <div className="dashboard-section">
        <h3 className="section-title">🔔 Alertas de Stock Crítico</h3>
        {productosBajos.length === 0 ? (
          <div className="dashboard-empty">
            <span className="empty-icon">✅</span>
            <p>¡Excelente! No hay productos con stock crítico en este momento. El inventario está saludable.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Producto</th>
                  <th>Stock Actual</th>
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
                    <td>${Number(p.precio).toLocaleString()}</td>
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