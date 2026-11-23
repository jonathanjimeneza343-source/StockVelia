import { Router } from "express";
import {
  registrarEmpresaYUsuario,
  loginUsuario,
  cambiarEmpresaActiva,
  solicitarRecuperacion,
  restablecerPassword,
} from "../controllers/authController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/register", registrarEmpresaYUsuario);

router.post("/login", loginUsuario);

router.post("/change-company", verificarToken, cambiarEmpresaActiva);

router.post("/forgot-password", solicitarRecuperacion);
router.post("/reset-password", restablecerPassword);

export default router;