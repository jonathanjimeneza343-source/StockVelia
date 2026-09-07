import express from "express";
import { obtenerReporteInventario, obtenerReporteMovimientos } from "../controllers/reporteController.js";

const router = express.Router();

router.get("/inventario/:idEmpresa", obtenerReporteInventario);
router.get("/movimientos/:idEmpresa", obtenerReporteMovimientos);

export default router;