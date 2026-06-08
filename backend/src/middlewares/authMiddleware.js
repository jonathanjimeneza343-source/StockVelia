import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

export const verificarToken = async (req, res, next) => {
    const tokenHeader = req.header('Authorization');

    if (!tokenHeader) {
        return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token de seguridad.' });
    }

    const token = tokenHeader.startsWith('Bearer ') ? tokenHeader.slice(7, tokenHeader.length) : tokenHeader;

    try {
        const tokenBaneado = await pool.query('SELECT * FROM tokens_blacklist WHERE token = $1', [token]);
        if (tokenBaneado.rows.length > 0) {
            return res.status(401).json({ error: 'Sesión inválida. Este token fue revocado al cerrar sesión.' });
        }

        const verificado = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = verificado;
        next();
    } catch (error) {
        res.status(403).json({ error: 'Token inválido o expirado. Inicia sesión de nuevo.' });
    }
};
