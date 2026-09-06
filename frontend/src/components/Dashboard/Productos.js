import React, { useEffect, useState, useCallback } from "react";
import { obtenerProductos, crearProducto, actualizarProducto, eliminarProducto } from "../../services/productoService";
import { obtenerCategorias } from "../../services/categoriaService";
import "../../styles/Productos.css";
import Swal from "sweetalert2";

function Productos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [idProductoEditando, setIdProductoEditando] = useState(null);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("");
  const [codigo, setCodigo] = useState("");
  const [imagen, setImagen] = useState("");
  const [idCategoria, setIdCategoria] = useState("");

  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const esAdmin = usuario?.id_rol === 1;

  const cargarDatos = useCallback(async () => {
    try {
      const idEmpresa = usuario.id_empresa;

      const [prodData, catData] = await Promise.all([
        obtenerProductos(idEmpresa),
        obtenerCategorias(idEmpresa)
      ]);

      setProductos(prodData);
      setCategorias(catData);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    }
  }, [usuario?.id_empresa]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const abrirFormularioCreacion = () => {
    setIdProductoEditando(null);
    setNombre("");
    setDescripcion("");
    setPrecio("");
    setStock("");
    setCodigo("");
    setImagen("");
    setIdCategoria("");
    setMostrarForm(!mostrarForm);
  };

  const iniciarEdicion = (p) => {
    setIdProductoEditando(p.id_producto);
    setNombre(p.nombre);
    setDescripcion(p.descripcion || "");
    setPrecio(p.precio);
    setStock(p.stock);
    setCodigo(p.codigo);
    setImagen(p.imagen || "");
    setIdCategoria(p.id_categoria);
    setMostrarForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    
    if (categorias.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Sin categorías",
        text: "Primero debes crear al menos una categoría en la sección correspondiente antes de registrar productos.",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#5e059e",
      });
      return;
    }

    try {
      const usuarioLogueado = JSON.parse(localStorage.getItem("usuario"));

      const datosProducto = {
        nombre,
        descripcion,
        precio: parseFloat(precio),
        stock: parseInt(stock),
        codigo,
        imagen,
        id_categoria: parseInt(idCategoria),
        id_empresa: usuarioLogueado.id_empresa,
      };

      if (idProductoEditando) {
        await actualizarProducto(idProductoEditando, datosProducto);
        Swal.fire({
          icon: "success",
          title: "¡Producto actualizado!",
          text: "Los cambios se han guardado con éxito.",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#5e059e",
        });
      } else {
        await crearProducto(datosProducto);
        Swal.fire({
          icon: "success",
          title: "¡Producto creado!",
          text: "El artículo se ha registrado con éxito.",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#5e059e",
        });
      }

      setNombre("");
      setDescripcion("");
      setPrecio("");
      setStock("");
      setCodigo("");
      setImagen("");
      setIdCategoria("");
      setIdProductoEditando(null);
      setMostrarForm(false);
      cargarDatos();

    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Ops...",
        text: error.response?.data?.error || "No se pudo completar la operación.",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#5e059e",
      });
    }
  };

  const handleEliminar = async (id_producto) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará el producto del inventario de forma permanente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#5e059e",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await eliminarProducto(id_producto);
          cargarDatos();
          Swal.fire({
            icon: "success",
            title: "¡Eliminado!",
            text: "El producto ha sido borrado con éxito.",
            confirmButtonColor: "#5e059e",
          });
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Error al eliminar",
            text: error.response?.data?.error || "No se pudo eliminar el producto.",
            confirmButtonText: "Entendido",
            confirmButtonColor: "#5e059e",
          });
        }
      }
    });
  };

  const verDetalles = (p) => {
    const categoriaEncontrada = categorias.find(cat => cat.id_categoria === p.id_categoria);
    const nombreCategoria = categoriaEncontrada ? categoriaEncontrada.nombre : "Sin categoría";

    Swal.fire({
      title: p.nombre,
      html: `
        <div style="text-align: left; font-size: 0.95rem; color: #333;">
          <p><strong>Código:</strong> ${p.codigo}</p>
          <p><strong>Categoría:</strong> ${nombreCategoria}</p>
          <p><strong>Descripción:</strong> ${p.descripcion || "Sin descripción"}</p>
          <p><strong>Precio:</strong> $${Number(p.precio).toLocaleString()}</p>
          <p><strong>Stock actual:</strong> ${p.stock}</p>
        </div>
      `,
      imageUrl: p.imagen || "https://placehold.co/200x200/fcfbff/6818a5?text=StockVelia",
      imageWidth: 150,
      imageHeight: 150,
      imageAlt: p.nombre,
      confirmButtonText: "Cerrar",
      confirmButtonColor: "#5e059e",
    });
  };

  return (
    <div className="productos-container">
      <div className="productos-header-top">
        <h2>Gestión de Productos</h2>
        {esAdmin && (
          <button 
            className="btn-toggle-form" 
            onClick={abrirFormularioCreacion}
          >
            {mostrarForm ? "Cancelar" : "+ Nuevo producto"}
          </button>
        )}
      </div>

      {esAdmin && mostrarForm && (
        <form className="productos-form animate-fade" onSubmit={handleGuardar}>
          <input
            className="productos-input"
            type="text"
            placeholder="Código"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            required
          />
          <input
            className="productos-input"
            type="text"
            placeholder="Nombre del producto"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />

          <select
            className="productos-input productos-select" 
            value={idCategoria}
            onChange={(e) => setIdCategoria(e.target.value)}
            required
          >
            <option value="">
              {categorias.length === 0 ? "No hay categorías creadas" : "Selecciona una categoría"}
            </option>
            {categorias.map((cat) => (
              <option key={cat.id_categoria} value={cat.id_categoria}>
                {cat.nombre}
              </option>
            ))}
          </select>

          {categorias.length === 0 && (
            <div className="alerta-sin-categorias">
              ⚠️ Debes registrar categorías en su sección antes de poder asociarlas a un producto.
            </div>
          )}

          <input
            className="productos-input"
            type="text"
            placeholder="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
          <input
            className="productos-input"
            type="url"
            placeholder="URL de la imagen (opcional)"
            value={imagen}
            onChange={(e) => setImagen(e.target.value)}
          />
          <input
            className="productos-input"
            type="number"
            placeholder="Precio"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            required
          />
          <input
            className="productos-input"
            type="number"
            placeholder="Stock inicial"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
          />
          <button type="submit" className="btn-submit">
            {idProductoEditando ? "Actualizar producto" : "Guardar producto"}
          </button>
        </form>
      )}

      <div className="products-cards-container">
        <div className="products-grid">
          {productos.map((p) => (
            <div className="product-card" key={p.id_producto}>
              <div className="product-image-box">
                <img 
                  src={p.imagen || "https://placehold.co/150x150/fcfbff/6818a5?text=StockVelia"} 
                  alt={p.nombre} 
                />
                <span className={`stock-badge ${p.stock <= 5 ? "low" : ""}`}>
                  Stock: {p.stock}
                </span>
              </div>
              <div className="product-info">
                <span className="product-code">Cod: {p.codigo}</span>
                <h3>{p.nombre}</h3>
                <p className="product-desc">{p.descripcion || "Sin descripción"}</p>
                <div className="product-footer">
                  <span className="product-price">${Number(p.precio).toLocaleString()}</span>
                  <div className="product-actions-group">
                    <button className="btn-action" onClick={() => verDetalles(p)}>Detalles</button>
                    {esAdmin && (
                      <>
                        <button className="btn-action" onClick={() => iniciarEdicion(p)}>Editar</button>
                        <button className="btn-action btn-delete" onClick={() => handleEliminar(p.id_producto)}>Eliminar</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Productos;