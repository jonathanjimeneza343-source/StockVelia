/**
 * @swagger
 * tags:
 *   name: Movimientos
 *   description: Registro de entradas, salidas y bajas de stock en el inventario
 */

/**
 * @swagger
 * /api/movimientos:
 *   get:
 *     summary: Obtiene el historial de todos los movimientos de inventario
 *     tags: [Movimientos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Historial de movimientos obtenido con éxito
 *   post:
 *     summary: Registra un movimiento (Actualiza el stock automáticamente mediante la BD)
 *     tags: [Movimientos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_producto
 *               - id_usuario
 *               - tipo_movimiento
 *               - motivo
 *               - cantidad
 *             properties:
 *               id_producto:
 *                 type: integer
 *                 example: 1
 *               id_usuario:
 *                 type: integer
 *                 example: 1
 *               tipo_movimiento:
 *                 type: string
 *                 enum: [ENTRADA, SALIDA, BAJA]
 *                 example: "ENTRADA"
 *               motivo:
 *                 type: string
 *                 example: "Compra a proveedor"
 *               cantidad:
 *                 type: integer
 *                 example: 10
 *               observacion:
 *                 type: string
 *                 example: "Recepción de mercancía en perfecto estado"
 *     responses:
 *       201:
 *         description: Movimiento registrado y stock actualizado exitosamente
 *       400:
 *         description: Stock insuficiente o datos incorrectos
 */