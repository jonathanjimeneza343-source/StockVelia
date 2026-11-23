import pool from "../config/db.js";
import { registrarAuditoria } from "../config/auditoriaService.js";

const normalizarTipoMovimiento = (tipoRaw) => {
  const limpio = String(tipoRaw || "").trim().toUpperCase();
  if (limpio === "ENTRADA") return "ENTRADA";
  if (limpio === "SALIDA" || limpio === "VENTA") return "SALIDA";
  if (limpio === "BAJA") return "BAJA";
  return null;
};

export const registrarMovimiento = async (req, res) => {
  const {
    id_producto,
    tipo_movimiento,
    motivo,
    cantidad,
    observacion,
    justificacion,
  } = req.body;
  const { id_usuario, id_empresa } = req.usuario;

  const cantidadNum = Number(cantidad);
  const tipoNormalizado = normalizarTipoMovimiento(tipo_movimiento);
  const motivoLimpio = motivo ? String(motivo).trim() : "";
  const observacionLimpia = observacion ? String(observacion).trim() : "";
  const justificacionLimpia = justificacion
    ? String(justificacion).trim()
    : observacionLimpia;

  if (!id_empresa) {
    return res
      .status(400)
      .json({ error: "No se ha seleccionado una empresa activa." });
  }

  if (
    !id_producto ||
    !tipoNormalizado ||
    Number.isNaN(cantidadNum) ||
    cantidadNum <= 0 ||
    !Number.isInteger(cantidadNum)
  ) {
    return res.status(400).json({
      error:
        "Producto, tipo de movimiento y una cantidad entera mayor a 0 son obligatorios.",
    });
  }

  const motivoFinal =
    motivoLimpio ||
    (tipoNormalizado === "ENTRADA"
      ? "Ingreso de inventario"
      : tipoNormalizado === "BAJA"
        ? "Baja/Daño"
        : "Salida de inventario");

  const requiereJustificacion =
    tipoNormalizado === "BAJA" ||
    ["Baja/Daño", "DANO", "OBSOLESCENCIA"].includes(motivoFinal);

  if (requiereJustificacion && !justificacionLimpia) {
    return res.status(400).json({
      error:
        "La justificación u observación es obligatoria para registrar una baja o daño.",
    });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const verificarEmpresa = await client.query(
      `SELECT id_empresa, stock, stock_minimo, estado
       FROM public.productos
       WHERE id_producto = $1
       FOR UPDATE`,
      [id_producto]
    );

    if (verificarEmpresa.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Producto no encontrado." });
    }

    const productoRow = verificarEmpresa.rows[0];
    if (Number(productoRow.id_empresa) !== Number(id_empresa)) {
      await client.query("ROLLBACK");
      return res.status(403).json({
        error: "No tienes autorización para alterar el stock de este producto.",
      });
    }

    if (String(productoRow.estado || "").toUpperCase() !== "ACTIVO") {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: "No se pueden registrar movimientos sobre un producto inactivo.",
      });
    }

    const stockActual = Number(productoRow.stock);
    const stockMinimo = Number(productoRow.stock_minimo ?? 5);

    if (tipoNormalizado !== "ENTRADA" && stockActual < cantidadNum) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: "Stock insuficiente para realizar esta salida.",
      });
    }
    
    const nuevoMovimiento = await client.query(
      `INSERT INTO public.movimientos_inventario
       (id_empresa, id_producto, id_usuario, tipo_movimiento, motivo, cantidad, justificacion, observacion)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        id_empresa,
        id_producto,
        id_usuario,
        tipoNormalizado,
        motivoFinal,
        cantidadNum,
        requiereJustificacion ? justificacionLimpia : justificacionLimpia || null,
        observacionLimpia || null,
      ]
    );

    const productoActualizado = await client.query(
      "SELECT stock, stock_minimo FROM public.productos WHERE id_producto = $1 AND id_empresa = $2",
      [id_producto, id_empresa]
    );

    const nuevoStock = Number(
      productoActualizado.rows[0]?.stock ?? stockActual
    );
    const minimoVigente = Number(
      productoActualizado.rows[0]?.stock_minimo ?? stockMinimo
    );

    await registrarAuditoria(
      id_usuario,
      "movimientos_inventario",
      tipoNormalizado,
      nuevoMovimiento.rows[0].id_movimiento,
      `Se procesó una ${tipoNormalizado} de ${cantidadNum} unidades (motivo: ${motivoFinal}).`
    );

    await client.query("COMMIT");

    const stockBajo = nuevoStock <= minimoVigente;

    return res.status(201).json({
      mensaje:
        "Movimiento de inventario procesado con éxito y stock actualizado.",
      movimiento: nuevoMovimiento.rows[0],
      stock_actual: nuevoStock,
      stock_minimo: minimoVigente,
      stock_bajo: stockBajo,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al procesar movimiento:", error.message);
    return res.status(400).json({
      error:
        error.message || "Error al procesar el movimiento de inventario.",
    });
  } finally {
    client.release();
  }
};

export const obtenerHistorialMovimientos = async (req, res) => {
  const { id_empresa } = req.usuario;
  if (!id_empresa) {
    return res
      .status(400)
      .json({ error: "No se ha seleccionado una empresa activa." });
  }

  try {
    const resultado = await pool.query(
      `SELECT
         m.*,
         p.nombre AS nombre_producto,
         p.codigo AS codigo_producto,
         u.nombre AS nombre_usuario,
         TO_CHAR(m.fecha, 'YYYY-MM-DD HH24:MI') AS fecha_formateada
       FROM public.movimientos_inventario m
       INNER JOIN public.productos p ON m.id_producto = p.id_producto
       INNER JOIN public.usuario u ON m.id_usuario = u.id_usuario
       WHERE m.id_empresa = $1 AND p.id_empresa = $1
       ORDER BY m.id_movimiento DESC`,
      [id_empresa]
    );
    return res.json(resultado.rows);
  } catch (error) {
    console.error("Error al obtener historial de movimientos:", error.message);
    return res
      .status(500)
      .json({ error: "Error al obtener el historial de movimientos." });
  }
};