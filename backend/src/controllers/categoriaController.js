import pool from "../config/db.js";
import { registrarAuditoria } from "../config/auditoriaService.js";

export const crearCategoria = async (req, res) => {
  const { nombre, descripcion } = req.body;
  const { id_usuario, id_empresa } = req.usuario;

  if (!id_empresa) {
    return res
      .status(400)
      .json({ error: "No se ha seleccionado una empresa activa." });
  }

  if (!nombre || !String(nombre).trim()) {
    return res
      .status(400)
      .json({ error: "El nombre de la categoría es obligatorio." });
  }

  const nombreLimpio = String(nombre).trim();

  try {
    const categoriaExiste = await pool.query(
      "SELECT 1 FROM public.categorias WHERE LOWER(nombre) = LOWER($1) AND id_empresa = $2 LIMIT 1",
      [nombreLimpio, id_empresa]
    );

    if (categoriaExiste.rows.length > 0) {
      return res.status(400).json({
        error: "La categoría ya existe en el sistema para esta empresa.",
      });
    }

    const nuevaCategoria = await pool.query(
      "INSERT INTO public.categorias (nombre, descripcion, id_empresa) VALUES ($1, $2, $3) RETURNING *",
      [
        nombreLimpio,
        descripcion ? String(descripcion).trim() : null,
        id_empresa,
      ]
    );

    await registrarAuditoria(
      id_usuario,
      "categorias",
      "CREAR",
      nuevaCategoria.rows[0].id_categoria,
      `Categoría creada: ${nombreLimpio}`
    );

    return res.status(201).json({
      mensaje: "Categoría creada con éxito.",
      categoria: nuevaCategoria.rows[0],
    });
  } catch (error) {
    console.error("Error al crear categoría:", error.message);
    return res.status(500).json({ error: "Error al crear la categoría." });
  }
};

export const obtenerCategorias = async (req, res) => {
  try {
    const id_empresa = req.usuario?.id_empresa;
    if (!id_empresa) {
      return res
        .status(400)
        .json({ error: "No se ha seleccionado una empresa activa." });
    }

    const resultado = await pool.query(
      "SELECT * FROM public.categorias WHERE id_empresa = $1 ORDER BY nombre ASC",
      [id_empresa]
    );
    return res.json(resultado.rows);
  } catch (error) {
    console.error("Error al obtener categorías:", error.message);
    return res.status(500).json({ error: "Error al obtener las categorías." });
  }
};

export const actualizarCategoria = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;
  const { id_usuario, id_empresa } = req.usuario;

  if (!id_empresa) {
    return res
      .status(400)
      .json({ error: "No se ha seleccionado una empresa activa." });
  }

  if (!nombre || !String(nombre).trim()) {
    return res
      .status(400)
      .json({ error: "El nombre de la categoría es obligatorio." });
  }

  const nombreLimpio = String(nombre).trim();

  try {
    const duplicada = await pool.query(
      `SELECT 1 FROM public.categorias
       WHERE LOWER(nombre) = LOWER($1)
         AND id_empresa = $2
         AND id_categoria <> $3
       LIMIT 1`,
      [nombreLimpio, id_empresa, id]
    );

    if (duplicada.rows.length > 0) {
      return res.status(400).json({
        error: "Ya existe otra categoría con ese nombre en tu empresa.",
      });
    }

    const resultado = await pool.query(
      `UPDATE public.categorias
       SET nombre = $1, descripcion = $2
       WHERE id_categoria = $3 AND id_empresa = $4
       RETURNING *`,
      [
        nombreLimpio,
        descripcion ? String(descripcion).trim() : null,
        id,
        id_empresa,
      ]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        error: "Categoría no encontrada o no pertenece a tu empresa.",
      });
    }

    await registrarAuditoria(
      id_usuario,
      "categorias",
      "ACTUALIZAR",
      resultado.rows[0].id_categoria,
      `Categoría actualizada: ${nombreLimpio}`
    );

    return res.json({
      mensaje: "Categoría actualizada con éxito.",
      categoria: resultado.rows[0],
    });
  } catch (error) {
    console.error("Error al actualizar categoría:", error.message);
    return res.status(500).json({ error: "Error al actualizar la categoría." });
  }
};

export const eliminarCategoria = async (req, res) => {
  const { id } = req.params;
  const { id_usuario, id_empresa } = req.usuario;

  if (!id_empresa) {
    return res
      .status(400)
      .json({ error: "No se ha seleccionado una empresa activa." });
  }

  try {
    const productosAsociados = await pool.query(
      `SELECT 1 FROM public.productos
       WHERE id_categoria = $1
         AND id_empresa = $2
         AND UPPER(COALESCE(estado, 'ACTIVO')) = 'ACTIVO'
       LIMIT 1`,
      [id, id_empresa]
    );

    if (productosAsociados.rows.length > 0) {
      return res.status(400).json({
        error:
          "No puedes eliminar esta categoría porque tiene productos activos asociados.",
      });
    }

    const eliminada = await pool.query(
      `DELETE FROM public.categorias
       WHERE id_categoria = $1 AND id_empresa = $2
       RETURNING id_categoria, nombre`,
      [id, id_empresa]
    );

    if (eliminada.rows.length === 0) {
      return res.status(404).json({
        error: "Categoría no encontrada o no pertenece a tu empresa.",
      });
    }

    await registrarAuditoria(
      id_usuario,
      "categorias",
      "ELIMINAR",
      eliminada.rows[0].id_categoria,
      `Categoría eliminada: ${eliminada.rows[0].nombre}`
    );

    return res.json({ mensaje: "Categoría eliminada con éxito." });
  } catch (error) {
    if (error.code === "23503") {
      return res.status(400).json({
        error:
          "No puedes eliminar esta categoría porque tiene registros asociados en el historial o inventario.",
      });
    }
    console.error("Error al eliminar categoría:", error.message);
    return res.status(500).json({ error: "Error al eliminar la categoría." });
  }
};