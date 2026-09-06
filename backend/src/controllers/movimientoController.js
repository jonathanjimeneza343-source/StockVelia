import pool from '../config/db.js';
import { registrarAuditoria } from '../config/auditoriaService.js';

export const registrarMovimiento = async (req, res) => {
    const { id_producto, tipo_movimiento, motivo, cantidad, observacion } = req.body;
    const { id_usuario, id_empresa } = req.usuario; 

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const verificarEmpresa = await client.query(
            'SELECT id_empresa, stock FROM productos WHERE id_producto = $1 FOR UPDATE', 
            [id_producto]
        );

        if (verificarEmpresa.rows.length === 0 || verificarEmpresa.rows[0].id_empresa !== id_empresa) {
            await client.query('ROLLBACK');
            return res.status(403).json({ error: 'No tienes autorización para alterar el stock de este producto.' });
        }

        const stockActual = verificarEmpresa.rows[0].stock;
        const tipoLower = tipo_movimiento.toLowerCase();

        let nuevoStock;
        if (tipoLower === 'entrada') {
            nuevoStock = stockActual + Number(cantidad);
        } else if (tipoLower === 'salida' || tipoLower === 'venta' || tipoLower === 'baja') {
            if (stockActual < cantidad) {
                await client.query('ROLLBACK');
                return res.status(400).json({ error: 'Stock insuficiente para realizar esta salida.' });
            }
            nuevoStock = stockActual - Number(cantidad);
        } else {
            nuevoStock = stockActual;
        }

        await client.query(
            'UPDATE productos SET stock = $1 WHERE id_producto = $2',
            [nuevoStock, id_producto]
        );

        const nuevoMovimiento = await client.query(
            'INSERT INTO movimientos_inventario (id_producto, id_usuario, tipo_movimiento, motivo, cantidad, observacion) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [id_producto, id_usuario, tipo_movimiento, motivo, cantidad, observacion]
        );

        await registrarAuditoria(id_usuario, 'movimientos_inventario', tipo_movimiento, nuevoMovimiento.rows[0].id_movimiento, `Se procesó una ${tipo_movimiento} de ${cantidad} unidades.`);

        await client.query('COMMIT');

        res.status(201).json({
            mensaje: 'Movimiento de inventario procesado con éxito y stock actualizado.',
            movimiento: nuevoMovimiento.rows[0]
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ error: 'Error al procesar el movimiento de inventario.' });
    } finally {
        client.release();
    }
};

export const obtenerHistorialMovimientos = async (req, res) => {
    const { id_empresa } = req.usuario; 
    try {
        const resultado = await pool.query(
            `SELECT m.*, p.nombre as nombre_producto, p.codigo as codigo_producto, u.nombre as nombre_usuario, 
                    TO_CHAR(m.fecha, 'YYYY-MM-DD HH24:MI') as fecha_formateada
             FROM movimientos_inventario m 
             JOIN productos p ON m.id_producto = p.id_producto 
             JOIN usuario u ON m.id_usuario = u.id_usuario 
             WHERE p.id_empresa = $1 
             ORDER BY m.id_movimiento DESC`,
            [id_empresa]
        );
        res.json(resultado.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el historial de movimientos.' });
    }
};