import pool from "../config/db.js";
import { registrarAuditoria } from "../config/auditoriaService.js";

const TIPOS_ENTRADA = ["entrada"];
const TIPOS_SALIDA = ["salida", "venta", "baja"];

export const registrarMovimiento = async (req, res) => {
  const { id_producto, tipo_movimiento, motivo, cantidad, observacion } = req.body;
  const { id_usuario, id_empresa } = req.usuario;

  const cantidadNum = Number(cantidad);
  const tipoLower = tipo_movimiento ? String(tipo_movimiento).trim().toLowerCase() : "";

  if (!id_producto || !tipoLower || Number.isNaN(cantidadNum) || cantidadNum <= 0) {
    return res.status(400).json({
      error: "Producto, tipo de movimiento y una cantidad mayor a 0 son obligatorios.",
    });
  }

  if (!TIPOS_ENTRADA.includes(tipoLower) && !TIPOS_SALIDA.includes(tipoLower)) {
    return res.status(400).json({
      error: "Tipo de movimiento no válido. Usa entrada, salida, venta o baja.",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const verificarEmpresa = await client.query(
      "SELECT id_empresa, stock, stock_minimo FROM productos WHERE id_producto = $1 FOR UPDATE",
      [id_producto],
    );

    if (
      verificarEmpresa.rows.length === 0 ||
      Number(verificarEmpresa.rows[0].id_empresa) !== Number(id_empresa)
    ) {
      await client.query("ROLLBACK");
      return res.status(403).json({
        error: "No tienes autorización para alterar el stock de este producto.",
      });
    }

    const stockActual = Number(verificarEmpresa.rows[0].stock);
    const stockMinimo = Number(verificarEmpresa.rows[0].stock_minimo);

    let nuevoStock;
    if (TIPOS_ENTRADA.includes(tipoLower)) {
      nuevoStock = stockActual + cantidadNum;
    } else {
      if (stockActual < cantidadNum) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          error: "Stock insuficiente para realizar esta salida.",
        });
      }
      nuevoStock = stockActual - cantidadNum;
    }

    await client.query(
      "UPDATE productos SET stock = $1 WHERE id_producto = $2",
      [nuevoStock, id_producto],
    );

    const nuevoMovimiento = await client.query(
      `INSERT INTO movimientos_inventario
       (id_producto, id_usuario, tipo_movimiento, motivo, cantidad, observacion)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        id_producto,
        id_usuario,
        tipoLower,
        motivo || null,
        cantidadNum,
        observacion || null,
      ],
    );

    await registrarAuditoria(
      id_usuario,
      "movimientos_inventario",
      tipoLower.toUpperCase(),
      nuevoMovimiento.rows[0].id_movimiento,
      `Se procesó una ${tipoLower} de ${cantidadNum} unidades.`,
    );

    await client.query("COMMIT");

    const stockBajo = nuevoStock <= stockMinimo;

    res.status(201).json({
      mensaje: "Movimiento de inventario procesado con éxito y stock actualizado.",
      movimiento: nuevoMovimiento.rows[0],
      stock_actual: nuevoStock,
      stock_minimo: stockMinimo,
      stock_bajo: stockBajo,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al procesar movimiento:", error.message);
    res.status(500).json({ error: "Error al procesar el movimiento de inventario." });
  } finally {
    client.release();
  }
};

export const obtenerHistorialMovimientos = async (req, res) => {
  const { id_empresa } = req.usuario;
  try {
    const resultado = await pool.query(
      `SELECT m.*, p.nombre AS nombre_producto, p.codigo AS codigo_producto, u.nombre AS nombre_usuario,
              TO_CHAR(m.fecha, 'YYYY-MM-DD HH24:MI') AS fecha_formateada
       FROM movimientos_inventario m
       JOIN productos p ON m.id_producto = p.id_producto
       JOIN usuario u ON m.id_usuario = u.id_usuario
       WHERE p.id_empresa = $1
       ORDER BY m.id_movimiento DESC`,
      [id_empresa],
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error("Error al obtener historial de movimientos:", error.message);
    res.status(500).json({ error: "Error al obtener el historial de movimientos." });
  }
};