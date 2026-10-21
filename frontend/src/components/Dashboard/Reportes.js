import React, { useState, useEffect, useCallback } from "react";
import { obtenerReporteInventario, obtenerReporteMovimientos } from "../../services/reporteService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../../styles/Reportes.css";

function Reportes() {
  const [tipoReporte, setTipoReporte] = useState("inventario");
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(false);

  const usuario = JSON.parse(localStorage.getItem("usuario"));

  const cargarReporte = useCallback(async () => {
    try {
      setCargando(true);
      const idEmpresa = usuario?.id_empresa;
      if (!idEmpresa) return;

      if (tipoReporte === "inventario") {
        const res = await obtenerReporteInventario(idEmpresa);
        setDatos(res);
      } else {
        const res = await obtenerReporteMovimientos(idEmpresa);
        setDatos(res);
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

  const descargarPDF = () => {
    if (datos.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    const doc = new jsPDF();
    
    // Título del documento
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text(`Reporte de ${tipoReporte === "inventario" ? "Inventario Actual" : "Historial de Movimientos"}`, 14, 20);
    
    // Subtítulo con fecha y empresa
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Empresa: ${usuario?.nombre_empresa || "StockVelia"} | Fecha: ${new Date().toLocaleDateString()}`, 14, 28);

    let columns = [];
    let body = [];

    if (tipoReporte === "inventario") {
      columns = ["Código", "Producto", "Categoría", "Stock", "Precio"];
      body = datos.map(item => [
        item.codigo,
        item.nombre,
        item.categoria_nombre || "Sin categoría",
        item.stock,
        `$${Number(item.precio).toLocaleString()}`
      ]);
    } else {
      columns = ["Fecha", "Tipo", "Producto", "Cantidad", "Usuario"];
      body = datos.map(item => [
        item.fecha && !isNaN(new Date(item.fecha)) 
          ? new Date(item.fecha).toLocaleDateString() 
          : "Sin fecha",
        item.tipo,
        item.producto_nombre,
        item.cantidad,
        item.usuario_nombre
      ]);
    }

    autoTable(doc, {
      startY: 35,
      head: [columns],
      body: body,
      theme: 'grid',
      headStyles: { fillColor: [110, 31, 143] },
      styles: { fontSize: 9, cellPadding: 4 }
    });

    doc.save(`reporte_${tipoReporte}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="reportes-container">
      <div className="reportes-header-top">
        <h2>Reportes del Sistema</h2>
        <div className="reportes-actions" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div className="reportes-tabs">
            <button 
              className={`tab-btn ${tipoReporte === "inventario" ? "active" : ""}`}
              onClick={() => setTipoReporte("inventario")}
            >
              Inventario Actual
            </button>
            <button 
              className={`tab-btn ${tipoReporte === "movimientos" ? "active" : ""}`}
              onClick={() => setTipoReporte("movimientos")}
            >
              Historial de Movimientos
            </button>
          </div>
          <button 
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
              gap: "6px"
            }}
          >
            📥 Descargar PDF
          </button>
        </div>
      </div>

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
                {datos.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-table">No hay datos para mostrar.</td>
                  </tr>
                ) : (
                  datos.map((item, index) => (
                    tipoReporte === "inventario" ? (
                      <tr key={index}>
                        <td>{item.codigo}</td>
                        <td>{item.nombre}</td>
                        <td>{item.categoria_nombre || "Sin categoría"}</td>
                        <td><span className={`stock-tag ${item.stock <= 5 ? "low" : ""}`}>{item.stock}</span></td>
                        <td>${Number(item.precio).toLocaleString()}</td>
                      </tr>
                    ) : (
                      <tr key={index}>
                        <td>
                          {item.fecha && !isNaN(new Date(item.fecha)) 
                            ? new Date(item.fecha).toLocaleDateString() 
                            : "Sin fecha"}
                        </td>
                        <td><span className={`mov-tag ${item.tipo}`}>{item.tipo}</span></td>
                        <td>{item.producto_nombre}</td>
                        <td>{item.cantidad}</td>
                        <td>{item.usuario_nombre}</td>
                      </tr>
                    )
                  ))
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