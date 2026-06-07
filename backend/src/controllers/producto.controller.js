const productoService = require('../services/producto.service');

const obtenerProductos = async (req, res) => {
    try {

        const productos =
            await productoService.obtenerProductos();

        res.status(200).json(productos);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: 'Error al obtener productos'
        });

    }
};

module.exports = {
    obtenerProductos
};