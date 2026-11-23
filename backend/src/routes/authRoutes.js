import { Router } from "express";
import {
  registrarEmpresaYUsuario,
  loginUsuario,
  cambiarEmpresaActiva,
  solicitarRecuperacion,
  restablecerPassword,
<<<<<<< HEAD
  cambiarEmpresaActiva,
  logoutUsuario,
=======
>>>>>>> rama-jonathan
} from "../controllers/authController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/register", registrarEmpresaYUsuario);

router.post("/login", loginUsuario);

router.post("/change-company", verificarToken, cambiarEmpresaActiva);
<<<<<<< HEAD
router.post("/logout", verificarToken, logoutUsuario);
=======

router.post("/forgot-password", solicitarRecuperacion);
router.post("/reset-password", restablecerPassword);
>>>>>>> rama-jonathan

export default router;