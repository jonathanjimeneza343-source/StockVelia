import pool from "../config/db.js";

export const obtenerReporteInventario = async (req, res) => {
  try {
    const idEmpresaToken = Number(req.usuario.id_empresa);
    const idEmpresaParam = req.params.idEmpresa ? Number(req.params.idEmpresa) : idEmpresaToken;

    if (!idEmpresaToken || idEmpresaParam !== idEmpresaToken) {
      return res.status(403).json({
        error: "No tienes permiso para consultar el reporte de esta empresa.",
      });
    }

    const { rows } = await pool.query(
      `SELECT p.codigo, p.nombre, c.nombre AS categoria_nombre, p.stock, p.precio
       FROM productos p
       LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
       WHERE p.id_empresa = $1 AND UPPER(COALESCE(p.estado, 'ACTIVO')) = 'ACTIVO'
       ORDER BY p.nombre ASC`,
      [idEmpresaToken],
    );
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener reporte de inventario:", error.message);
    res.status(500).json({ error: "Error al obtener reporte de inventario" });
  }
};

export const obtenerReporteMovimientos = async (req, res) => {
  try {
    const idEmpresaToken = Number(req.usuario.id_empresa);
    const idEmpresaParam = req.params.idEmpresa ? Number(req.params.idEmpresa) : idEmpresaToken;

    if (!idEmpresaToken || idEmpresaParam !== idEmpresaToken) {
      return res.status(403).json({
        error: "No tienes permiso para consultar los movimientos de esta empresa.",
      });
    }

    const { rows } = await pool.query(
      `SELECT m.fecha, m.tipo_movimiento AS tipo, p.nombre AS producto_nombre, m.cantidad, u.nombre AS usuario_nombre
       FROM movimientos_inventario m
       JOIN productos p ON m.id_producto = p.id_producto
       JOIN usuario u ON m.id_usuario = u.id_usuario
       WHERE p.id_empresa = $1
       ORDER BY m.fecha DESC`,
      [idEmpresaToken],
    );
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener historial de movimientos:", error.message);
    res.status(500).json({ error: "Error al obtener historial de movimientos" });
  }
};