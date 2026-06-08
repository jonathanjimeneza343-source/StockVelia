import { Router } from 'express';
import { 
    registrarEmpresaYUsuario, 
    loginUsuario, 
    solicitarRecuperacion, 
    restablecerPassword 
} from '../controllers/authController.js';
import { verificarToken } from '../middlewares/authMiddleware.js';
import pool from '../config/db.js';

const router = Router();

router.post('/register', registrarEmpresaYUsuario);
router.post('/login', loginUsuario);
router.post('/forgot-password', solicitarRecuperacion);
router.post('/reset-password', restablecerPassword);

router.post('/logout', verificarToken, async (req, res) => {
    try {
        const tokenHeader = req.header('Authorization');
        const token = tokenHeader.startsWith('Bearer ') ? tokenHeader.slice(7, tokenHeader.length) : tokenHeader;
        
        const decoded = req.usuario;
        const fechaExpiracion = new Date(decoded.exp * 1000); 

        await pool.query(
            'INSERT INTO tokens_blacklist (token, fecha_expiracion) VALUES ($1, $2)',
            [token, fechaExpiracion]
        );

        res.json({ mensaje: 'Sesión cerrada con éxito. Token revocado.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al cerrar sesión.' });
    }
});

export default router;
