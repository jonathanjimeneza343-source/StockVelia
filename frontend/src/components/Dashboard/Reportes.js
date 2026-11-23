import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  obtenerReporteInventario,
  obtenerReporteMovimientos,
} from "../../services/reporteService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";
import "../../styles/Reportes.css";

function Reportes() {
  const [tipoReporte, setTipoReporte] = useState("inventario");
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(false);

  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [movimientosBase, setMovimientosBase] = useState([]);

  const usuario = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("usuario")) || {};
    } catch {
      return {};
    }
  }, []);

  const cargarReporte = useCallback(async () => {
    try {
      setCargando(true);
      const idEmpresa = usuario?.id_empresa;
      if (!idEmpresa) return;

      if (tipoReporte === "inventario") {
        const res = await obtenerReporteInventario(idEmpresa);
        setDatos(Array.isArray(res) ? res : []);
      } else {
        const res = await obtenerReporteMovimientos(idEmpresa);
        const lista = Array.isArray(res) ? res : [];
        setMovimientosBase(lista);
        setDatos(lista);
      }
    } catch (error) {
      console.error("Error al cargar reporte:", error);
    } finally {
      setCargando(false);
    }
  }, [tipoReporte, usuario?.id_empresa]);

  useEffect(() => {
    cargarReporte();
  }, [cargarReporte]);

  const datosFiltrados = useMemo(() => {
    if (tipoReporte === "inventario") {
      return datos;
    }

    const inicioTs = fechaInicio
      ? new Date(`${fechaInicio}T00:00:00`).getTime()
      : null;
    const finTs = fechaFin
      ? new Date(`${fechaFin}T23:59:59.999`).getTime()
      : null;

    return datos.filter((item) => {
      if (inicioTs || finTs) {
        if (!item.fecha || Number.isNaN(new Date(item.fecha).getTime())) {
          return false;
        }
        const itemTs = new Date(item.fecha).getTime();
        if (inicioTs && itemTs < inicioTs) return false;
        if (finTs && itemTs > finTs) return false;
      }

      if (productoSeleccionado) {
        const nombreProd = String(item.producto_nombre || "").toLowerCase();
        if (nombreProd !== productoSeleccionado.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [tipoReporte, datos, fechaInicio, fechaFin, productoSeleccionado]);

  // Totales agregados de inventario (HU-016)
  const resumenInventario = useMemo(() => {
    if (tipoReporte !== "inventario") {
      return { volumenTotal: 0, valorTotal: 0, porCategoria: [] };
    }

    let volumenTotal = 0;
    let valorTotal = 0;
    const mapaCategorias = new Map();

    datosFiltrados.forEach((item) => {
      const stock = Number(item.stock || 0);
      const precio = Number(item.precio || 0);
      const subtotal = stock * precio;
      const cat = item.categoria_nombre || "Sin categoría";

      volumenTotal += stock;
      valorTotal += subtotal;

      const actual = mapaCategorias.get(cat) || {
        categoria: cat,
        unidades: 0,
        valor: 0,
      };
      actual.unidades += stock;
      actual.valor += subtotal;
      mapaCategorias.set(cat, actual);
    });

    return {
      volumenTotal,
      valorTotal,
      porCategoria: Array.from(mapaCategorias.values()),
    };
  }, [tipoReporte, datosFiltrados]);

  const productosUnicos = useMemo(() => {
    const setNombres = new Set();
    movimientosBase.forEach((m) => {
      if (m.producto_nombre) setNombres.add(m.producto_nombre);
    });
    return Array.from(setNombres);
  }, [movimientosBase]);

  const descargarPDF = () => {
    if (datosFiltrados.length === 0) {
      Swal.fire({
        icon: "info",
        iconColor: "#5e059e",
        title: "Sin datos",
        text: "No hay datos para exportar con los filtros actuales.",
        confirmButtonColor: "#5e059e",
      });
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text(
      `Reporte de ${tipoReporte === "inventario"
        ? "Inventario Actual"
        : "Historial de Movimientos"
      }`,
      14,
      20
    );

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Empresa: ${usuario?.nombre_empresa || "StockVelia"} | Fecha: ${new Date().toLocaleDateString()}`,
      14,
      28
    );

    let columns = [];
    let body = [];

    if (tipoReporte === "inventario") {
      columns = [
        "Código",
        "Producto",
        "Categoría",
        "Stock",
        "Precio",
        "Valoración",
      ];
      body = datosFiltrados.map((item) => [
        item.codigo,
        item.nombre,
        item.categoria_nombre || "Sin categoría",
        item.stock,
        `$${Number(item.precio || 0).toLocaleString()}`,
        `$${(Number(item.stock || 0) * Number(item.precio || 0)).toLocaleString()}`,
      ]);
    } else {
      columns = ["Fecha", "Tipo", "Producto", "Cantidad", "Usuario"];
      body = datosFiltrados.map((item) => [
        item.fecha && !Number.isNaN(new Date(item.fecha).getTime())
          ? new Date(item.fecha).toLocaleDateString()
          : "Sin fecha",
        item.tipo,
        item.producto_nombre,
        item.cantidad,
        item.usuario_nombre,
      ]);
    }

    autoTable(doc, {
      startY: 35,
      head: [columns],
      body,
      theme: "grid",
      headStyles: { fillColor: [110, 31, 143] },
      styles: { fontSize: 9, cellPadding: 4 },
    });

    doc.save(
      `reporte_${tipoReporte}_${new Date().toISOString().slice(0, 10)}.pdf`
    );
  };

  const descargarExcelCSV = () => {
    if (datosFiltrados.length === 0) {
      Swal.fire({
        icon: "info",
        iconColor: "#5e059e",
        title: "Sin datos",
        text: "No hay datos para exportar con los filtros actuales.",
        confirmButtonColor: "#5e059e",
      });
      return;
    }

    const escapar = (val) => `"${String(val ?? "").replace(/"/g, '""')}"`;

    const headers =
      tipoReporte === "inventario"
        ? ["Código", "Producto", "Categoría", "Stock", "Precio", "Valoración"]
        : ["Fecha", "Tipo", "Producto", "Cantidad", "Usuario"];

    const filas = datosFiltrados.map((item) =>
      tipoReporte === "inventario"
        ? [
          item.codigo,
          item.nombre,
          item.categoria_nombre || "Sin categoría",
          item.stock,
          Number(item.precio || 0),
          Number(item.stock || 0) * Number(item.precio || 0),
        ]
        : [
          item.fecha && !Number.isNaN(new Date(item.fecha).getTime())
            ? new Date(item.fecha).toLocaleDateString()
            : "Sin fecha",
          item.tipo,
          item.producto_nombre,
          item.cantidad,
          item.usuario_nombre,
        ]
    );

    const csvContent =
      "\uFEFF" +
      [headers, ...filas]
        .map((fila) => fila.map(escapar).join(";"))
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `reporte_${tipoReporte}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="reportes-container">
      <div className="reportes-header-top">
        <h2>Reportes del Sistema</h2>
        <div
          className="reportes-actions"
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div className="reportes-tabs">
            <button
              type="button"
              className={`tab-btn ${tipoReporte === "inventario" ? "active" : ""
                }`}
              onClick={() => setTipoReporte("inventario")}
            >
              Inventario Actual
            </button>
            <button
              type="button"
              className={`tab-btn ${tipoReporte === "movimientos" ? "active" : ""
                }`}
              onClick={() => setTipoReporte("movimientos")}
            >
              Historial de Movimientos
            </button>
          </div>

          <button
            type="button"
            onClick={descargarExcelCSV}
            style={{
              backgroundColor: "#059669",
              color: "#fff",
              border: "none",
              padding: "8px 14px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            📊 Exportar Excel (.csv)
          </button>

          <button
            type="button"
            onClick={descargarPDF}
            className="btn-pdf"
            style={{
              backgroundColor: "#6e1f8f",
              color: "#fff",
              border: "none",
              padding: "8px 15px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            📥 Descargar PDF
          </button>
        </div>
      </div>

      {/* Filtros de fecha e historial individual en movimientos (HU-017 & HU-018) */}
      {tipoReporte === "movimientos" && (
        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <label style={{ fontSize: "0.88rem" }}>
            Desde:{" "}
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </label>
          <label style={{ fontSize: "0.88rem" }}>
            Hasta:{" "}
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </label>
          <select
            value={productoSeleccionado}
            onChange={(e) => setProductoSeleccionado(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: "6px" }}
          >
            <option value="">Todos los productos (Historial general)</option>
            {productosUnicos.map((nombre) => (
              <option key={nombre} value={nombre}>
                Historial de: {nombre}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="tab-btn"
            onClick={() => {
              setFechaInicio("");
              setFechaFin("");
              setProductoSeleccionado("");
            }}
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {/* Totales agregados y por categoría en inventario (HU-016) */}
      {tipoReporte === "inventario" && (
        <div style={{ marginBottom: "18px" }}>
          <div
            style={{
              display: "flex",
              gap: "20px",
              flexWrap: "wrap",
              marginBottom: "10px",
              fontWeight: "600",
            }}
          >
            <span>
              Volumen total de unidades: {resumenInventario.volumenTotal} un.
            </span>
            <span>
              Valoración económica total: $
              {resumenInventario.valorTotal.toLocaleString()}
            </span>
          </div>
          {resumenInventario.porCategoria.length > 0 && (
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {resumenInventario.porCategoria.map((c) => (
                <span
                  key={c.categoria}
                  style={{
                    backgroundColor: "#f3e8ff",
                    color: "#4c1d95",
                    padding: "6px 10px",
                    borderRadius: "8px",
                    fontSize: "0.85rem",
                  }}
                >
                  <strong>{c.categoria}:</strong> {c.unidades} un. ($
                  {c.valor.toLocaleString()})
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="reportes-content-box">
        {cargando ? (
          <p className="loading-text">Generando reporte...</p>
        ) : (
          <div className="table-responsive">
            <table className="reportes-table">
              <thead>
                {tipoReporte === "inventario" ? (
                  <tr>
                    <th>Código</th>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Stock</th>
                    <th>Precio</th>
                    <th>Valoración</th>
                  </tr>
                ) : (
                  <tr>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Usuario</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {datosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-table">
                      No hay datos para mostrar.
                    </td>
                  </tr>
                ) : (
                  datosFiltrados.map((item, index) =>
                    tipoReporte === "inventario" ? (
                      <tr key={item.id_producto ?? index}>
                        <td>{item.codigo}</td>
                        <td>{item.nombre}</td>
                        <td>{item.categoria_nombre || "Sin categoría"}</td>
                        <td>
                          <span
                            className={`stock-tag ${Number(item.stock) <=
                                Number(item.stock_minimo ?? 5)
                                ? "low"
                                : ""
                              }`}
                          >
                            {item.stock}
                          </span>
                        </td>
                        <td>${Number(item.precio || 0).toLocaleString()}</td>
                        <td>
                          $
                          {(
                            Number(item.stock || 0) * Number(item.precio || 0)
                          ).toLocaleString()}
                        </td>
                      </tr>
                    ) : (
                      <tr key={item.id_movimiento ?? index}>
                        <td>
                          {item.fecha &&
                            !Number.isNaN(new Date(item.fecha).getTime())
                            ? new Date(item.fecha).toLocaleDateString()
                            : "Sin fecha"}
                        </td>
                        <td>
                          <span className={`mov-tag ${item.tipo}`}>
                            {item.tipo}
                          </span>
                        </td>
                        <td>{item.producto_nombre}</td>
                        <td>{item.cantidad}</td>
                        <td>{item.usuario_nombre}</td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reportes;