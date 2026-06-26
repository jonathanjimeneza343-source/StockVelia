import express from "express";
import {
  listarUsuarios,
  crearUsuario,
  cambiarEstadoUsuario
} from "../controllers/usuarioController.js";

const router = express.Router();

router.get("/", listarUsuarios);
router.post("/", crearUsuario);
router.put("/estado/:id", cambiarEstadoUsuario);

export default router;