import dotenv from 'dotenv';
dotenv.config(); 

import express from 'express';
import cors from 'cors';
import pool from './config/db.js'; 
import authRoutes from './routes/authRoutes.js'; 
import categoriaRoutes from './routes/categoriaRoutes.js'; 
import productoRoutes from './routes/productoRoutes.js'; 
import movimientoRoutes from './routes/movimientoRoutes.js'; 

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.use('/api/auth', authRoutes); 
app.use('/api/categorias', categoriaRoutes); 
app.use('/api/productos', productoRoutes); 
app.use('/api/movimientos', movimientoRoutes); 

app.get('/prueba-db', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT NOW()');
        res.json({ 
            mensaje: "¡Conexión exitosa a PostgreSQL desde Express!", 
            hora_base_datos: resultado.rows[0].now 
        });
    } catch (error) {
        console.error("Error al consultar la base de datos:", error);
        res.status(500).json({ error: "No se pudo conectar a la base de datos" });
    }
});

app.get('/', (req, res) => {
    res.json({ mensaje: "¡Servidor de StockVelia funcionando correctamente!" });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo con éxito en http://localhost:${PORT}`);
});
