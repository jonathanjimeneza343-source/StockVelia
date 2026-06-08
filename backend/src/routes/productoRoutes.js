import { Router } from 'express';
import { crearProducto, obtenerProductos, actualizarProducto, eliminarProductoLogico } from '../controllers/productoController.js';
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/', verificarToken, crearProducto);
router.get('/', verificarToken, obtenerProductos);
router.put('/:id', verificarToken, actualizarProducto);
router.delete('/:id', verificarToken, eliminarProductoLogico);

export default router;
