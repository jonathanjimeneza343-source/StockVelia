import { Router } from "express";
import {
  crearCategoria,
  obtenerCategorias,
  actualizarCategoria,
  eliminarCategoria,
} from "../controllers/categoriaController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(verificarToken);

router.post("/", crearCategoria);
router.get("/", obtenerCategorias);
router.put("/:id", actualizarCategoria);
router.delete("/:id", eliminarCategoria);

export default router;