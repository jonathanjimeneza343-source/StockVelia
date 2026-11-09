/**
 * @swagger
 * tags:
 *   name: Reportes
 *   description: Generación de reportes analíticos del inventario y auditoría
 */

/**
 * @swagger
 * /api/reportes/inventario:
 *   get:
 *     summary: Obtiene el reporte general del estado actual de los productos en stock
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reporte generado correctamente
 *       401:
 *         description: No autorizado
 */

/**
 * @swagger
 * /api/reportes/movimientos:
 *   get:
 *     summary: Obtiene reporte filtrado de movimientos de inventario por fechas u operador
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fecha_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio (YYYY-MM-DD)
 *       - in: query
 *         name: fecha_fin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Reporte de movimientos obtenido con éxito
 */