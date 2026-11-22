import express from "express";
import {
  obtenerReporteInventario,
  obtenerReporteMovimientos,
} from "../controllers/reporteController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(verificarToken);

router.get("/inventario/:idEmpresa", obtenerReporteInventario);
router.get("/movimientos/:idEmpresa", obtenerReporteMovimientos);

export default router;