import { Router } from 'express';
import { crearCategoria, obtenerCategorias } from '../controllers/categoriaController.js';
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/', verificarToken, crearCategoria);
router.get('/', verificarToken, obtenerCategorias);

export default router;
