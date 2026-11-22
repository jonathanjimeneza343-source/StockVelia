import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import pool from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import categoriaRoutes from './routes/categoriaRoutes.js';
import productoRoutes from './routes/productoRoutes.js';
import movimientoRoutes from './routes/movimientoRoutes.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import reporteRoutes from './routes/reporteRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((url) => url.trim())
  : null;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || !allowedOrigins || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Origen no permitido por CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '5mb' }));

const serverUrl =
  process.env.API_URL ||
  process.env.RENDER_EXTERNAL_URL ||
  `http://localhost:${PORT}`;

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de StockVelia',
      version: '1.0.0',
      description:
        'Documentación oficial completa de la API del sistema de gestión e inventario StockVelia',
    },
    servers: [
      {
        url: serverUrl,
        description:
          process.env.NODE_ENV === 'production'
            ? 'Servidor de producción'
            : 'Servidor de desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [
    './src/routes/*.js',
    './src/docs/*.js',
    './src/routes/*.swagger.js',
    './src/docs/*.swagger.js',
    './app.js',
  ],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/api/auth', authRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/movimientos', movimientoRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/reportes', reporteRoutes);

app.get('/prueba-db', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT NOW()');
    res.json({
      mensaje: 'Conexión exitosa a PostgreSQL desde Express.',
      hora_base_datos: resultado.rows[0].now,
    });
  } catch (error) {
    console.error('Error al consultar la base de datos:', error.message);
    res.status(500).json({ error: 'No se pudo conectar a la base de datos.' });
  }
});

app.get('/', (req, res) => {
  res.json({ mensaje: 'Servidor de StockVelia funcionando correctamente.' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  console.log(`Swagger disponible en ${serverUrl}/api-docs`);
});