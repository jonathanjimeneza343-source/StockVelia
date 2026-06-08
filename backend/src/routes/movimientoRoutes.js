import { Router } from 'express';
import { registrarMovimiento, obtenerHistorialMovimientos } from '../controllers/movimientoController.js';
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/', verificarToken, registrarMovimiento);
router.get('/', verificarToken, obtenerHistorialMovimientos);

export default router;
