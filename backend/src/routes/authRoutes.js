import { Router } from "express";
import {
  registrarEmpresaYUsuario,
  loginUsuario,
  solicitarRecuperacion,
  restablecerPassword,
  cambiarEmpresaActiva,
  logoutUsuario,
} from "../controllers/authController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/register", registrarEmpresaYUsuario);
router.post("/login", loginUsuario);
router.post("/forgot-password", solicitarRecuperacion);
router.post("/reset-password", restablecerPassword);
router.post("/change-company", verificarToken, cambiarEmpresaActiva);
router.post("/logout", verificarToken, logoutUsuario);

export default router;