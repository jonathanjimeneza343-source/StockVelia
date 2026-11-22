import express from "express";
import {
  listarUsuarios,
  crearUsuario,
  cambiarEstadoUsuario,
} from "../controllers/usuarioController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(verificarToken);

router.get("/", listarUsuarios);
router.post("/", crearUsuario);
router.put("/estado/:id", cambiarEstadoUsuario);

export default router;