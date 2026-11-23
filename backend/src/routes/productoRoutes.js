import { Router } from "express";
import {
    crearProducto,
    obtenerProductos,
    actualizarProducto,
    eliminarProductoLogico,
} from "../controllers/productoController.js";
import { verificarToken, verificarRol } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(verificarToken);

router.get("/", obtenerProductos);
router.post("/", crearProducto);

router.put("/:id", verificarRol(1, 2), actualizarProducto);
router.delete("/:id", verificarRol(1, 2), eliminarProductoLogico);

export default router;