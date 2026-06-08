import pool from '../config/db.js';
import { registrarAuditoria } from '../config/auditoriaService.js';

export const registrarMovimiento = async (req, res) => {
    const { id_producto, tipo_movimiento, motivo, cantidad, observacion } = req.body;
    const { id_usuario, id_empresa } = req.usuario; 
    try {
        const verificarEmpresa = await pool.query('SELECT id_empresa FROM productos WHERE id_producto = $1', [id_producto]);
        if (verificarEmpresa.rows.length === 0 || verificarEmpresa.rows[0].id_empresa !== id_empresa) {
            return res.status(403).json({ error: 'No tienes autorización para alterar el stock de este producto.' });
        }

        const nuevoMovimiento = await pool.query(
            'INSERT INTO movimientos_inventario (id_producto, id_usuario, tipo_movimiento, motivo, cantidad, observacion) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [id_producto, id_usuario, tipo_movimiento, motivo, cantidad, observacion]
        );

        await registrarAuditoria(id_usuario, 'movimientos_inventario', tipo_movimiento, nuevoMovimiento.rows[0].id_movimiento, `Se procesó una ${tipo_movimiento} de ${cantidad} unidades.`);

        res.status(201).json({
            mensaje: 'Movimiento de inventario procesado con éxito.',
            movimiento: nuevoMovimiento.rows[0]
        });
    } catch (error) {
        console.error(error);
        if (error.message.includes('Stock insuficiente')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error al procesar el movimiento de inventario.' });
    }
};

export const obtenerHistorialMovimientos = async (req, res) => {
    const { id_empresa } = req.usuario; 
    try {
        const resultado = await pool.query(
            'SELECT m.*, p.nombre as nombre_producto, p.codigo as codigo_producto, u.nombre as nombre_usuario FROM movimientos_inventario m JOIN productos p ON m.id_producto = p.id_producto JOIN usuario u ON m.id_usuario = u.id_usuario WHERE p.id_empresa = $1 ORDER BY m.fecha_movimiento DESC',
            [id_empresa]
        );
        res.json(resultado.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el historial de movimientos.' });
    }
};
