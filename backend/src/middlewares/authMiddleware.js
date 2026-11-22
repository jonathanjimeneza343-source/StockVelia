import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

export const verificarToken = async (req, res, next) => {
  const tokenHeader = req.header('Authorization');

  if (!tokenHeader) {
    return res
      .status(401)
      .json({ error: 'Acceso denegado. No se proporcionó un token de seguridad.' });
  }

  const token = (
    tokenHeader.startsWith('Bearer ') ? tokenHeader.slice(7) : tokenHeader
  ).trim();

  if (!token) {
    return res
      .status(401)
      .json({ error: 'Acceso denegado. Formato de token inválido.' });
  }

  if (!process.env.JWT_SECRET) {
    console.error('CRITICAL: La variable de entorno JWT_SECRET no está definida.');
    return res
      .status(500)
      .json({ error: 'Error interno de configuración del servidor.' });
  }

  try {
    const tokenBaneado = await pool.query(
      'SELECT 1 FROM tokens_blacklist WHERE token = $1 LIMIT 1',
      [token]
    );

    if (tokenBaneado.rows.length > 0) {
      return res
        .status(401)
        .json({ error: 'Sesión inválida. Este token fue revocado al cerrar sesión.' });
    }
  } catch (dbError) {
    console.error('Error al verificar blacklist de tokens:', dbError.message);
    return res
      .status(500)
      .json({ error: 'Error interno al validar la sesión.' });
  }

  try {
    const verificado = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = verificado;
    next();
  } catch (error) {
    return res
      .status(403)
      .json({ error: 'Token inválido o expirado. Inicia sesión de nuevo.' });
  }
};

export const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario || !req.usuario.rol) {
      return res
        .status(403)
        .json({ error: 'Acceso denegado. No se pudo verificar el rol del usuario.' });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res
        .status(403)
        .json({ error: 'No tienes permisos suficientes para realizar esta acción.' });
    }

    next();
  };
};