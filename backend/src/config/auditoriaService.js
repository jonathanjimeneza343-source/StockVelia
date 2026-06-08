import pool from './db.js';

export const registrarAuditoria = async (id_usuario, tabla_afectada, accion, registro_id, descripcion) => {
    try {
        await pool.query(
            'INSERT INTO auditoria (id_usuario, tabla_afectada, accion, registro_id, descripcion) VALUES ($1, $2, $3, $4, $5)',
            [id_usuario, tabla_afectada, accion, registro_id, descripcion]
        );
    } catch (error) {
        console.error('Error al guardar el registro de auditoría:', error);
    }
};
