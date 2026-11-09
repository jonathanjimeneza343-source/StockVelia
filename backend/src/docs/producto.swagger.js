/**
 * @swagger
 * tags:
 *   name: Productos
 *   description: Control de inventario y catálogo de productos
 */

/**
 * @swagger
 * /api/productos:
 *   get:
 *     summary: Obtiene todos los productos registrados
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de productos obtenida con éxito
 *   post:
 *     summary: Registra un nuevo producto en el inventario
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_empresa
 *               - id_categoria
 *               - codigo
 *               - nombre
 *               - precio
 *             properties:
 *               id_empresa:
 *                 type: integer
 *                 example: 1
 *               id_categoria:
 *                 type: integer
 *                 example: 3
 *               codigo:
 *                 type: string
 *                 example: "PROD-001"
 *               nombre:
 *                 type: string
 *                 example: "Laptop Lenovo ThinkPad"
 *               descripcion:
 *                 type: string
 *                 example: "Core i5, 16GB RAM"
 *               precio:
 *                 type: number
 *                 example: 2500000.00
 *               stock:
 *                 type: integer
 *                 example: 15
 *               stock_minimo:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       201:
 *         description: Producto creado correctamente
 */

/**
 * @swagger
 * /api/productos/{id}:
 *   get:
 *     summary: Obtiene un producto específico por su ID
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto encontrado
 *       404:
 *         description: Producto no encontrado
 *   put:
 *     summary: Actualiza un producto existente
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               precio:
 *                 type: number
 *               stock:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Producto actualizado con éxito
 *   delete:
 *     summary: Elimina un producto del inventario
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto eliminado exitosamente
 */