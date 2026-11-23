import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from "../../services/productoService";
import { obtenerCategorias } from "../../services/categoriaService";
import ModalProducto from "./modales/ModalProducto";
import "../../styles/Productos.css";
import Swal from "sweetalert2";

const cacheProductosPorEmpresa = new Map();
const peticionesProductosEnCurso = new Map();

function obtenerUsuarioGuardado() {
  try {
    return JSON.parse(localStorage.getItem("usuario")) || {};
  } catch {
    return {};
  }
}

function filtrarProductosActivos(lista) {
  return (Array.isArray(lista) ? lista : []).filter(
    (p) =>
      p.estado !== false &&
      String(p.estado_producto || p.estado || "").toLowerCase() !== "inactivo" &&
      String(p.estado_producto || p.estado || "").toLowerCase() !== "eliminado"
  );
}

function Productos() {
  const usuario = useMemo(() => obtenerUsuarioGuardado(), []);
  const idEmpresa = usuario?.id_empresa;
  const cacheInicial = idEmpresa ? cacheProductosPorEmpresa.get(idEmpresa) : null;

  const [productos, setProductos] = useState(cacheInicial?.productos || []);
  const [categorias, setCategorias] = useState(cacheInicial?.categorias || []);
  const [cargando, setCargando] = useState(!cacheInicial);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoAEditar, setProductoAEditar] = useState(null);
  const [busquedaTexto, setBusquedaTexto] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("todas");
  const [estadoStockFiltro, setEstadoStockFiltro] = useState("todos");
  const [precioMinFiltro, setPrecioMinFiltro] = useState("");
  const [precioMaxFiltro, setPrecioMaxFiltro] = useState("");

  const rolNumero = Number(usuario?.id_rol);
  const esAdmin = rolNumero === 1 || rolNumero === 2;
  const puedeCrearProducto = [1, 2, 3].includes(rolNumero);

  const cargarDatos = useCallback(
    async (silencioso = false, soloProductos = false, forzarRed = false) => {
      if (!idEmpresa) {
        setCargando(false);
        return;
      }

      const tieneCache = cacheProductosPorEmpresa.has(idEmpresa);
      if (!silencioso && !tieneCache) {
        setCargando(true);
      }

      try {
        let promesa = peticionesProductosEnCurso.get(idEmpresa);
        if (!promesa || forzarRed) {
          promesa = (async () => {
            const previa = cacheProductosPorEmpresa.get(idEmpresa);
            const [prodData, catData] = await Promise.all([
              obtenerProductos(),
              soloProductos && previa?.categorias
                ? Promise.resolve(previa.categorias)
                : obtenerCategorias(),
            ]);

            const activos = filtrarProductosActivos(prodData);
            const listaCat = Array.isArray(catData) ? catData : [];
            return { productos: activos, categorias: listaCat };
          })().finally(() => {
            peticionesProductosEnCurso.delete(idEmpresa);
          });
          peticionesProductosEnCurso.set(idEmpresa, promesa);
        }

        const datos = await promesa;
        cacheProductosPorEmpresa.set(idEmpresa, datos);
        setProductos(datos.productos);
        setCategorias(datos.categorias);
      } catch (error) {
        if (!silencioso) {
          console.error("Error al cargar datos de productos:", error);
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

    const ejecutar = async (esSilencioso, forzar = false) => {
      if (!activo) return;
      await cargarDatos(esSilencioso, false, forzar);
    };

    ejecutar(false, false);
    const intervalo = setInterval(() => {
      ejecutar(true, true);
    }, 30000);

    return () => {
      activo = false;
      clearInterval(intervalo);
    };
  }, [cargarDatos]);

  const abrirModalCreacion = () => {
    if (!puedeCrearProducto) return;
    if (categorias.length === 0) {
      Swal.fire({
        icon: "warning",
        iconColor: "#5e059e",
        title: "Sin categorías",
        text: "Primero debes crear al menos una categoría antes de registrar productos.",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#5e059e",
      });
      return;
    }
    setProductoAEditar(null);
    setModalAbierto(true);
  };

  const abrirModalEdicion = (p) => {
    if (!esAdmin) return;
    setProductoAEditar(p);
    setModalAbierto(true);
  };

  const handleGuardarProducto = async (datosProducto) => {
    try {
      const usuarioLogueado = obtenerUsuarioGuardado();
      const payload = {
        ...datosProducto,
        id_empresa: usuarioLogueado.id_empresa,
      };
      if (productoAEditar) {
        if (!esAdmin) {
          Swal.fire({
            icon: "error",
            iconColor: "#5e059e",
            title: "Acceso restringido",
            text: "No tienes permisos para editar productos.",
            confirmButtonText: "Entendido",
            confirmButtonColor: "#5e059e",
          });
          return;
        }
        await actualizarProducto(productoAEditar.id_producto, payload);
        Swal.fire({
          icon: "success",
          iconColor: "#5e059e",
          title: "¡Producto actualizado!",
          text: "Los cambios se han guardado con éxito.",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#5e059e",
        });
      } else {
        await crearProducto(payload);
        Swal.fire({
          icon: "success",
          iconColor: "#5e059e",
          title: "¡Producto creado!",
          text: "El artículo se ha registrado con éxito.",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#5e059e",
        });
      }
      setModalAbierto(false);
      setProductoAEditar(null);
      await cargarDatos(false, true, true);
    } catch (error) {
      Swal.fire({
        icon: "error",
        iconColor: "#5e059e",
        title: "No se pudo guardar",
        text:
          error.response?.data?.error ||
          "Verifica los datos ingresados o si el código ya existe.",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#5e059e",
      });
    }
  };

  const handleEliminar = (p) => {
    if (!esAdmin) return;
    Swal.fire({
      title: "¿Dar de baja este producto?",
      text: "Si el producto tiene historial de movimientos, pasará a estado Inactivo para preservar la integridad histórica y auditoría.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#5e059e",
      confirmButtonText: "Sí, dar de baja",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await eliminarProducto(p.id_producto);
          await cargarDatos(false, true, true);
          Swal.fire({
            icon: "success",
            iconColor: "#5e059e",
            title: "¡Producto dado de baja!",
            text: "El producto ya no aparecerá en el catálogo operativo activo.",
            confirmButtonColor: "#5e059e",
          });
        } catch (error) {
          Swal.fire({
            icon: "error",
            iconColor: "#5e059e",
            title: "Error al dar de baja",
            text:
              error.response?.data?.error ||
              "No se pudo procesar la baja del producto.",
            confirmButtonText: "Entendido",
            confirmButtonColor: "#5e059e",
          });
        }
      }
    });
  };

  const verDetalles = (p) => {
    const categoriaEncontrada = categorias.find(
      (cat) => Number(cat.id_categoria) === Number(p.id_categoria)
    );
    const nombreCategoria = categoriaEncontrada
      ? categoriaEncontrada.nombre
      : p.categoria_nombre || "Sin categoría";
    Swal.fire({
      title: p.nombre,
      html: `
        <div style="text-align: left; font-size: 0.95rem; color: #333;">
          <p><strong>Código:</strong> ${p.codigo}</p>
          <p><strong>Categoría:</strong> ${nombreCategoria}</p>
          <p><strong>Descripción:</strong> ${p.descripcion || "Sin descripción"}</p>
          <p><strong>Precio:</strong> $${Number(p.precio || 0).toLocaleString()}</p>
          <p><strong>Stock actual:</strong> ${p.stock}</p>
          <p><strong>Stock mínimo:</strong> ${p.stock_minimo ?? 5}</p>
        </div>
      `,
      imageUrl:
        p.imagen ||
        "https://placehold.co/200x200/fcfbff/6818a5?text=StockVelia",
      imageWidth: 150,
      imageHeight: 150,
      imageAlt: p.nombre,
      confirmButtonText: "Cerrar",
      confirmButtonColor: "#5e059e",
    });
  };

  const productosFiltrados = useMemo(() => {
    const texto = busquedaTexto.trim().toLowerCase();
    const minP = precioMinFiltro !== "" ? Number(precioMinFiltro) : null;
    const maxP = precioMaxFiltro !== "" ? Number(precioMaxFiltro) : null;
    return productos.filter((p) => {
      const coincideTexto =
        !texto ||
        String(p.nombre || "").toLowerCase().includes(texto) ||
        String(p.codigo || "").toLowerCase().includes(texto);
      const coincideCategoria =
        categoriaFiltro === "todas" ||
        Number(p.id_categoria) === Number(categoriaFiltro);
      const umbral = Number(p.stock_minimo ?? 5);
      const stockActual = Number(p.stock ?? 0);
      const coincideEstadoStock =
        estadoStockFiltro === "todos" ||
        (estadoStockFiltro === "bajo" && stockActual <= umbral) ||
        (estadoStockFiltro === "disponible" && stockActual > umbral);
      const precioActual = Number(p.precio ?? 0);
      const coincideMin =
        minP === null || Number.isNaN(minP) || precioActual >= minP;
      const coincideMax =
        maxP === null || Number.isNaN(maxP) || precioActual <= maxP;
      return (
        coincideTexto &&
        coincideCategoria &&
        coincideEstadoStock &&
        coincideMin &&
        coincideMax
      );
    });
  }, [
    productos,
    busquedaTexto,
    categoriaFiltro,
    estadoStockFiltro,
    precioMinFiltro,
    precioMaxFiltro,
  ]);

  const limpiarFiltros = () => {
    setBusquedaTexto("");
    setCategoriaFiltro("todas");
    setEstadoStockFiltro("todos");
    setPrecioMinFiltro("");
    setPrecioMaxFiltro("");
  };

  return (
    <div className="productos-container">
      <div className="productos-header-top">
        <h2>Gestión de Productos</h2>
        {puedeCrearProducto && (
          <button
            type="button"
            className="btn-toggle-form"
            onClick={abrirModalCreacion}
          >
            + Nuevo producto
          </button>
        )}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          marginBottom: "18px",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="Buscar por nombre o código..."
          value={busquedaTexto}
          onChange={(e) => setBusquedaTexto(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            minWidth: "220px",
          }}
        />
        <select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
          }}
        >
          <option value="todas">Todas las categorías</option>
          {categorias.map((cat) => (
            <option key={cat.id_categoria} value={cat.id_categoria}>
              {cat.nombre}
            </option>
          ))}
        </select>
        <select
          value={estadoStockFiltro}
          onChange={(e) => setEstadoStockFiltro(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
          }}
        >
          <option value="todos">Todo el stock</option>
          <option value="bajo">Stock bajo / crítico</option>
          <option value="disponible">Stock saludable</option>
        </select>
        <input
          type="number"
          min="0"
          placeholder="Precio mín."
          value={precioMinFiltro}
          onChange={(e) => setPrecioMinFiltro(e.target.value)}
          style={{
            width: "120px",
            padding: "8px 10px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
          }}
        />
        <input
          type="number"
          min="0"
          placeholder="Precio máx."
          value={precioMaxFiltro}
          onChange={(e) => setPrecioMaxFiltro(e.target.value)}
          style={{
            width: "120px",
            padding: "8px 10px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
          }}
        />
        <button
          type="button"
          className="btn-action"
          onClick={limpiarFiltros}
        >
          Limpiar filtros
        </button>
      </div>

      <div className="products-cards-container">
        {cargando && productos.length === 0 ? (
          <p style={{ padding: "20px", color: "#6b7280" }}>
            Cargando productos...
          </p>
        ) : productosFiltrados.length === 0 ? (
          <p style={{ padding: "20px", color: "#6b7280" }}>
            No se encontraron productos con los filtros seleccionados.
          </p>
        ) : (
          <div className="products-grid">
            {productosFiltrados.map((p) => {
              const umbralMinimo = Number(p.stock_minimo ?? 5);
              const esBajoStock = Number(p.stock) <= umbralMinimo;
              return (
                <div className="product-card" key={p.id_producto}>
                  <div className="product-image-box">
                    <img
                      src={
                        p.imagen ||
                        "https://placehold.co/150x150/fcfbff/6818a5?text=StockVelia"
                      }
                      alt={p.nombre}
                    />
                    <span className={`stock-badge ${esBajoStock ? "low" : ""}`}>
                      {esBajoStock
                        ? `⚠️ Stock: ${p.stock}`
                        : `Stock: ${p.stock}`}
                    </span>
                  </div>
                  <div className="product-info">
                    <span className="product-code">Cod: {p.codigo}</span>
                    <h3>{p.nombre}</h3>
                    <p className="product-desc">
                      {p.descripcion || "Sin descripción"}
                    </p>
                    <div className="product-footer">
                      <span className="product-price">
                        ${Number(p.precio || 0).toLocaleString()}
                      </span>
                      <div className="product-actions-group">
                        <button
                          type="button"
                          className="btn-action"
                          onClick={() => verDetalles(p)}
                        >
                          Detalles
                        </button>
                        {esAdmin && (
                          <>
                            <button
                              type="button"
                              className="btn-action"
                              onClick={() => abrirModalEdicion(p)}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              className="btn-action btn-delete"
                              onClick={() => handleEliminar(p)}
                            >
                              Eliminar
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ModalProducto
        isOpen={modalAbierto}
        onClose={() => {
          setModalAbierto(false);
          setProductoAEditar(null);
        }}
        onGuardar={handleGuardarProducto}
        productoAEditar={productoAEditar}
        categorias={categorias}
      />
    </div>
  );
}

export default Productos;