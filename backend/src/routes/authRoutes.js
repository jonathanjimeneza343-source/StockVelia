import { Router } from "express";
import {
  registrarEmpresaYUsuario,
  loginUsuario,
  solicitarRecuperacion,
  restablecerPassword,
  cambiarEmpresaActiva,
} from "../controllers/authController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";
import pool from "../config/db.js";

const router = Router();

router.post("/register", registrarEmpresaYUsuario);
router.post("/login", loginUsuario);
router.post("/forgot-password", solicitarRecuperacion);
router.post("/reset-password", restablecerPassword);
router.post("/change-company", verificarToken, cambiarEmpresaActiva);

router.post("/logout", verificarToken, async (req, res) => {
  try {
    const tokenHeader = req.header("Authorization");
    const token = (
      tokenHeader.startsWith("Bearer ") ? tokenHeader.slice(7) : tokenHeader
    ).trim();

    const decoded = req.usuario;
    const fechaExpiracion = decoded.exp
      ? new Date(decoded.exp * 1000)
      : new Date(Date.now() + 2 * 60 * 60 * 1000);

    await pool.query(
      `INSERT INTO tokens_blacklist (token, fecha_expiracion)
       VALUES ($1, $2)
       ON CONFLICT (token) DO NOTHING`,
      [token, fechaExpiracion],
    );

    res.json({ mensaje: "Sesión cerrada con éxito. Token revocado." });
  } catch (error) {
    console.error("Error al cerrar sesión:", error.message);
    res.status(500).json({ error: "Error al cerrar sesión." });
  }
});

export default router;