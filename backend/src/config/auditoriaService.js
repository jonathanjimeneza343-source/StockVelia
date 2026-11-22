import pool from "./db.js";

export const registrarAuditoria = async (
  id_usuario,
  tabla_afectada,
  accion,
  registro_id,
  descripcion,
) => {
  try {
    const usuarioId = id_usuario ? Number(id_usuario) : null;
    const registroId =
      registro_id !== undefined && registro_id !== null && !Number.isNaN(Number(registro_id))
        ? Number(registro_id)
        : null;

    await pool.query(
      `INSERT INTO auditoria (id_usuario, tabla_afectada, accion, registro_id, descripcion)
       VALUES ($1, $2, $3, $4, $5)`,
      [usuarioId, tabla_afectada, accion, registroId, descripcion],
    );
  } catch (error) {
    console.error("Error al guardar el registro de auditoría:", error.message);
  }
};