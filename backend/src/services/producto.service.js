const pool = require('../config/db');

const obtenerProductos = async () => {
    const resultado = await pool.query(`
        SELECT *
        FROM productos
        ORDER BY id_producto
    `);

    return resultado.rows;
};

module.exports = {
    obtenerProductos
};