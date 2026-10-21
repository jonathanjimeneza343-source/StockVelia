import pool from "../config/db.js";

export const obtenerReporteInventario = async (req, res) => {
  try {
    const { idEmpresa } = req.params;
    const { rows } = await pool.query(
      `SELECT p.codigo, p.nombre, c.nombre AS categoria_nombre, p.stock, p.precio 
       FROM productos p 
       LEFT JOIN categorias c ON p.id_categoria = c.id_categoria 
       WHERE p.id_empresa = $1`,
      [idEmpresa]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener reporte de inventario" });
  }
};

export const obtenerReporteMovimientos = async (req, res) => {
  try {
    const { idEmpresa } = req.params;
    const { rows } = await pool.query(
      `SELECT m.fecha, m.tipo_movimiento AS tipo, p.nombre AS producto_nombre, m.cantidad, u.nombre AS usuario_nombre 
       FROM movimientos_inventario m 
       JOIN productos p ON m.id_producto = p.id_producto 
       JOIN usuario u ON m.id_usuario = u.id_usuario 
       WHERE p.id_empresa = $1 
       ORDER BY m.fecha DESC`,
      [idEmpresa]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener historial de movimientos" });
  }
};