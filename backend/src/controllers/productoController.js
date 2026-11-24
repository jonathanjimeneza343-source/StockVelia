import pool from "../config/db.js";
import { registrarAuditoria } from "../config/auditoriaService.js";

const validarCategoriaDeEmpresa = async (idCategoria, idEmpresa) => {
  const categoriaNum = Number(idCategoria);
  if (!categoriaNum || Number.isNaN(categoriaNum)) return false;
  const res = await pool.query(
    "SELECT 1 FROM public.categorias WHERE id_categoria = $1 AND id_empresa = $2 LIMIT 1",
    [categoriaNum, idEmpresa]
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
    stock_minimo !== undefined &&
      stock_minimo !== "" &&
      !Number.isNaN(Number(stock_minimo)) &&
      Number(stock_minimo) >= 0
      ? Math.floor(Number(stock_minimo))
      : 5;

  if (!id_empresa) {
    return res
      .status(400)
      .json({ error: "No se ha seleccionado una empresa activa." });
  }

  if (
    !codigo ||
    !String(codigo).trim() ||
    !nombre ||
    !String(nombre).trim() ||
    !id_categoria ||
    Number.isNaN(precioNum) ||
    precioNum < 0 ||
    Number.isNaN(stockNum) ||
    stockNum < 0 ||
    !Number.isInteger(stockNum)
  ) {
    return res.status(400).json({
      error:
        "Código, nombre, categoría, precio (>= 0) y stock entero (>= 0) son obligatorios.",
    });
  }

  const codigoLimpio = String(codigo).trim();
  const nombreLimpio = String(nombre).trim();

  try {
    const categoriaValida = await validarCategoriaDeEmpresa(
      id_categoria,
      id_empresa
    );
    if (!categoriaValida) {
      return res.status(400).json({
        error:
          "La categoría seleccionada no existe o no pertenece a tu empresa.",
      });
    }

    const productoExiste = await pool.query(
      `SELECT 1 FROM public.productos
       WHERE LOWER(codigo) = LOWER($1)
         AND id_empresa = $2
         AND UPPER(COALESCE(estado, 'ACTIVO')) = 'ACTIVO'
       LIMIT 1`,
      [codigoLimpio, id_empresa]
    );
    if (productoExiste.rows.length > 0) {
      return res.status(400).json({
        error:
          "El código de barras o SKU ya está registrado en un producto activo de tu empresa.",
      });
    }

    const nuevoProducto = await pool.query(
      `INSERT INTO public.productos
       (id_empresa, id_categoria, codigo, nombre, descripcion, precio, stock, stock_minimo, imagen, estado)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'ACTIVO')
       RETURNING *`,
      [
        id_empresa,
        Number(id_categoria),
        codigoLimpio,
        nombreLimpio,
        descripcion ? String(descripcion).trim() : null,
        precioNum,
        stockNum,
        stockMinimoFinal,
        imagen ? String(imagen).trim() : null,
      ]
    );

    await registrarAuditoria(
      id_usuario,
      "productos",
      "CREAR",
      nuevoProducto.rows[0].id_producto,
      `Producto creado: ${nombreLimpio} con stock inicial de ${stockNum}`
    );

    return res.status(201).json({
      mensaje: "Producto registrado con éxito.",
      producto: nuevoProducto.rows[0],
    });
  } catch (error) {
    console.error("Error al crear producto:", error.message);
    return res
      .status(500)
      .json({ error: "Error al registrar el producto." });
  }
};

export const obtenerProductos = async (req, res) => {
  const { id_empresa } = req.usuario;
  if (!id_empresa) {
    return res
      .status(400)
      .json({ error: "No se ha seleccionado una empresa activa." });
  }

  try {
    const resultado = await pool.query(
      `SELECT p.*, c.nombre AS nombre_categoria
       FROM public.productos p
       LEFT JOIN public.categorias c ON p.id_categoria = c.id_categoria
       WHERE p.id_empresa = $1 AND UPPER(COALESCE(p.estado, 'ACTIVO')) = 'ACTIVO'
       ORDER BY p.nombre ASC`,
      [id_empresa]
    );
    return res.json(resultado.rows);
  } catch (error) {
    console.error("Error al obtener productos:", error.message);
    return res.status(500).json({ error: "Error al obtener los productos." });
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
    stock_minimo !== undefined &&
      stock_minimo !== "" &&
      !Number.isNaN(Number(stock_minimo)) &&
      Number(stock_minimo) >= 0
      ? Math.floor(Number(stock_minimo))
      : 5;

  if (!id_empresa) {
    return res
      .status(400)
      .json({ error: "No se ha seleccionado una empresa activa." });
  }

  if (
    !codigo ||
    !String(codigo).trim() ||
    !nombre ||
    !String(nombre).trim() ||
    !id_categoria ||
    Number.isNaN(precioNum) ||
    precioNum < 0
  ) {
    return res.status(400).json({
      error:
        "Código, nombre, categoría y un precio válido (>= 0) son obligatorios.",
    });
  }

  const codigoLimpio = String(codigo).trim();
  const nombreLimpio = String(nombre).trim();

  try {
    const categoriaValida = await validarCategoriaDeEmpresa(
      id_categoria,
      id_empresa
    );
    if (!categoriaValida) {
      return res.status(400).json({
        error:
          "La categoría seleccionada no existe o no pertenece a tu empresa.",
      });
    }

    const codigoDuplicado = await pool.query(
      `SELECT 1 FROM public.productos
       WHERE LOWER(codigo) = LOWER($1)
         AND id_empresa = $2
         AND id_producto <> $3
         AND UPPER(COALESCE(estado, 'ACTIVO')) = 'ACTIVO'
       LIMIT 1`,
      [codigoLimpio, id_empresa, id]
    );
    if (codigoDuplicado.rows.length > 0) {
      return res.status(400).json({
        error:
          "El código de barras o SKU ya está registrado en otro producto activo de tu empresa.",
      });
    }

    const resultado = await pool.query(
      `UPDATE public.productos
       SET id_categoria = $1,
           codigo = $2,
           nombre = $3,
           descripcion = $4,
           precio = $5,
           stock_minimo = $6,
           imagen = $7,
           fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id_producto = $8 AND id_empresa = $9
       RETURNING *`,
      [
        Number(id_categoria),
        codigoLimpio,
        nombreLimpio,
        descripcion ? String(descripcion).trim() : null,
        precioNum,
        stockMinimoFinal,
        imagen ? String(imagen).trim() : null,
        id,
        id_empresa,
      ]
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
      `Producto actualizado: ${nombreLimpio}. Precio nuevo: ${precioNum}`
    );

    return res.json({
      mensaje: "Producto actualizado con éxito.",
      producto: resultado.rows[0],
    });
  } catch (error) {
    console.error("Error al actualizar producto:", error.message);
    return res
      .status(500)
      .json({ error: "Error al actualizar el producto." });
  }
};

export const eliminarProductoLogico = async (req, res) => {
  const { id } = req.params;
  const { id_usuario, id_empresa } = req.usuario;

  if (!id_empresa) {
    return res
      .status(400)
      .json({ error: "No se ha seleccionado una empresa activa." });
  }

  try {
    const resultado = await pool.query(
      `UPDATE public.productos
       SET estado = 'INACTIVO',
           fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id_producto = $1 AND id_empresa = $2
       RETURNING *`,
      [id, id_empresa]
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
      `Producto desactivado: ${resultado.rows[0].nombre}`
    );

    return res.json({
      mensaje: "Producto desactivado del inventario con éxito.",
    });
  } catch (error) {
    console.error("Error al eliminar producto:", error.message);
    return res
      .status(500)
      .json({ error: "Error al eliminar el producto." });
  }
};