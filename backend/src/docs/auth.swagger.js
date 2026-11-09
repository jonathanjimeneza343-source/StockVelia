/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticación, inicio de sesión y recuperación de cuentas
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión en el sistema
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correo
 *               - password
 *             properties:
 *               correo:
 *                 type: string
 *                 example: "admin@stockvelia.com"
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Autenticación exitosa, retorna el token JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1Ni..."
 *       400:
 *         description: Credenciales inválidas o usuario bloqueado
 */

/**
 * @swagger
 * /api/auth/recuperar-password:
 *   post:
 *     summary: Solicita un código de recuperación de contraseña
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correo
 *             properties:
 *               correo:
 *                 type: string
 *                 example: "usuario@stockvelia.com"
 *     responses:
 *       200:
 *         description: Código de recuperación enviado al correo exitosamente
 */