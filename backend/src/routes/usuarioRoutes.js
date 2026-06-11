import express from "express";
import {
  listarUsuarios,
  crearUsuario
} from "../controllers/usuarioController.js";

const router = express.Router();

router.get("/", listarUsuarios);
router.post("/", crearUsuario);

export default router;