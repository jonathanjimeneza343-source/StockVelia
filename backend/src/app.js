const express = require('express');
const cors = require('cors');
const pool = require('./config/db');

const productoRoutes = require('./routes/producto.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/productos', productoRoutes);

pool.query('SELECT NOW()')
    .then(result => {
        console.log('Base de datos conectada');
    })
    .catch(error => {
        console.error(error);
    });

app.get('/', (req, res) => {
    res.json({
        mensaje: 'API StockVelia funcionando'
    });
});

module.exports = app;