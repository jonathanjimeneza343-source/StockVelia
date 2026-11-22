import pool from "../config/db.js";
import { registrarAuditoria } from "../config/auditoriaService.js";

const validarCategoriaDeEmpresa = async (idCategoria, idEmpresa) => {
  if (!idCategoria) return true;
  const res = await pool.query(
    "SELECT 1 FROM categorias WHERE id_categoria = $1 AND id_empresa = $2 LIMIT 1",
    [idCategoria, idEmpresa],
  );
  return res.rows.length > 0;
};

export const crearProducto = async (req, res) => {
  const {
    id_categoria,
    codigo,
    nombre,
    descripcion,
    precio,
    stock,
    stock_minimo,
    imagen,
  } = req.body;
  const { id_empresa, id_usuario } = req.usuario;

  const precioNum = Number(precio);
  const stockNum = Number(stock);
  const stockMinimoFinal =
    stock_minimo !== undefined && stock_minimo !== "" && !Number.isNaN(Number(stock_minimo))
      ? Number(stock_minimo)
      : 5;

  if (!codigo || !nombre || Number.isNaN(precioNum) || precioNum < 0 || Number.isNaN(stockNum) || stockNum < 0) {
    return res.status(400).json({
      error: "Código, nombre, precio válido y stock válido son obligatorios.",
    });
  }

  try {
    const categoriaValida = await validarCategoriaDeEmpresa(id_categoria, id_empresa);
    if (!categoriaValida) {
      return res.status(400).json({
        error: "La categoría seleccionada no existe o no pertenece a tu empresa.",
      });
    }

    const productoExiste = await pool.query(
      "SELECT 1 FROM productos WHERE codigo = $1 AND id_empresa = $2 LIMIT 1",
      [String(codigo).trim(), id_empresa],
    );

    if (productoExiste.rows.length > 0) {
      return res.status(400).json({
        error: "El código de barras o SKU ya está registrado en tu empresa.",
      });
    }

    const nuevoProducto = await pool.query(
      `INSERT INTO productos
       (id_empresa, id_categoria, codigo, nombre, descripcion, precio, stock, stock_minimo, imagen)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        id_empresa,
        id_categoria || null,
        String(codigo).trim(),
        String(nombre).trim(),
        descripcion || null,
        precioNum,
        stockNum,
        stockMinimoFinal,
        imagen || null,
      ],
    );

    await registrarAuditoria(
      id_usuario,
      "productos",
      "CREAR",
      nuevoProducto.rows[0].id_producto,
      `Producto creado: ${String(nombre).trim()} con stock inicial de ${stockNum}`,
    );

    res.status(201).json({
      mensaje: "Producto registrado con éxito.",
      producto: nuevoProducto.rows[0],
    });
  } catch (error) {
    console.error("Error al crear producto:", error.message);
    res.status(500).json({ error: "Error al registrar el producto." });
  }
};

export const obtenerProductos = async (req, res) => {
  const { id_empresa } = req.usuario;

  try {
    const resultado = await pool.query(
      `SELECT p.*, c.nombre AS nombre_categoria
       FROM productos p
       LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
       WHERE p.id_empresa = $1 AND p.estado = TRUE
       ORDER BY p.nombre ASC`,
      [id_empresa],
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error("Error al obtener productos:", error.message);
    res.status(500).json({ error: "Error al obtener los productos." });
  }
};

export const actualizarProducto = async (req, res) => {
  const { id } = req.params;
  const {
    id_categoria,
    codigo,
    nombre,
    descripcion,
    precio,
    stock_minimo,
    imagen,
  } = req.body;
  const { id_usuario, id_empresa } = req.usuario;

  const precioNum = Number(precio);
  const stockMinimoFinal =
    stock_minimo !== undefined && stock_minimo !== "" && !Number.isNaN(Number(stock_minimo))
      ? Number(stock_minimo)
      : 5;

  if (!codigo || !nombre || Number.isNaN(precioNum) || precioNum < 0) {
    return res.status(400).json({
      error: "Código, nombre y un precio válido son obligatorios.",
    });
  }

  try {
    const categoriaValida = await validarCategoriaDeEmpresa(id_categoria, id_empresa);
    if (!categoriaValida) {
      return res.status(400).json({
        error: "La categoría seleccionada no existe o no pertenece a tu empresa.",
      });
    }

    const resultado = await pool.query(
      `UPDATE productos
       SET id_categoria = $1, codigo = $2, nombre = $3, descripcion = $4, precio = $5, stock_minimo = $6, imagen = $7
       WHERE id_producto = $8 AND id_empresa = $9
       RETURNING *`,
      [
        id_categoria || null,
        String(codigo).trim(),
        String(nombre).trim(),
        descripcion || null,
        precioNum,
        stockMinimoFinal,
        imagen || null,
        id,
        id_empresa,
      ],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        error: "Producto no encontrado o no pertenece a tu empresa.",
      });
    }

    await registrarAuditoria(
      id_usuario,
      "productos",
      "ACTUALIZAR",
      id,
      `Producto actualizado: ${String(nombre).trim()}. Precio nuevo: ${precioNum}`,
    );

    res.json({
      mensaje: "Producto actualizado con éxito.",
      producto: resultado.rows[0],
    });
  } catch (error) {
    console.error("Error al actualizar producto:", error.message);
    res.status(500).json({ error: "Error al actualizar el producto." });
  }
};

export const eliminarProductoLogico = async (req, res) => {
  const { id } = req.params;
  const { id_usuario, id_empresa } = req.usuario;

  try {
    const resultado = await pool.query(
      `UPDATE productos
       SET estado = FALSE
       WHERE id_producto = $1 AND id_empresa = $2
       RETURNING *`,
      [id, id_empresa],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        error: "Producto no encontrado o no pertenece a tu empresa.",
      });
    }

    await registrarAuditoria(
      id_usuario,
      "productos",
      "ELIMINAR_LOGICO",
      id,
      `Producto desactivado: ${resultado.rows[0].nombre}`,
    );

    res.json({ mensaje: "Producto desactivado del inventario con éxito." });
  } catch (error) {
    console.error("Error al eliminar producto:", error.message);
    res.status(500).json({ error: "Error al eliminar el producto." });
  }
};