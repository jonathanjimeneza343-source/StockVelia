import pool from '../config/db.js';
import { registrarAuditoria } from '../config/auditoriaService.js';

export const crearProducto = async (req, res) => {
    const { id_categoria, codigo, nombre, descripcion, precio, stock, stock_minimo, imagen } = req.body;
    const { id_empresa, id_usuario } = req.usuario; 
    
    const stockMinimoFinal = (stock_minimo !== undefined && stock_minimo !== "" && !isNaN(stock_minimo)) ? stock_minimo : 5;
    
    try {
        // Validar si el código ya existe DENTRO de la misma empresa activa
        const productoExiste = await pool.query(
            'SELECT * FROM productos WHERE codigo = $1 AND id_empresa = $2', 
            [codigo, id_empresa]
        );
        
        if (productoExiste.rows.length > 0) {
            return res.status(400).json({ error: 'El código de barras o SKU ya está registrado en tu empresa.' });
        }
        
        const nuevoProducto = await pool.query(
            'INSERT INTO productos (id_empresa, id_categoria, codigo, nombre, descripcion, precio, stock, stock_minimo, imagen) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [id_empresa, id_categoria, codigo, nombre, descripcion, precio, stock, stockMinimoFinal, imagen || null]
        );

        await registrarAuditoria(
            id_usuario, 
            'productos', 
            'CREAR', 
            nuevoProducto.rows[0].id_producto, 
            `Producto creado: ${nombre} con stock inicial de ${stock}`
        );

        res.status(201).json({
            mensaje: 'Producto registrado con éxito.',
            producto: nuevoProducto.rows[0]
        });
    } catch (error) {
        console.error("Error al crear producto:", error);
        res.status(500).json({ error: 'Error al registrar el producto.' });
    }
};

export const obtenerProductos = async (req, res) => {
    const { id_empresa } = req.usuario; 
    
    try {
        const resultado = await pool.query(
            'SELECT p.*, c.nombre as nombre_categoria FROM productos p JOIN categorias c ON p.id_categoria = c.id_categoria WHERE p.id_empresa = $1 AND p.estado = TRUE ORDER BY p.nombre ASC',
            [id_empresa]
        );
        res.json(resultado.rows);
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ error: 'Error al obtener los productos.' });
    }
};

export const actualizarProducto = async (req, res) => {
    const { id } = req.params;
    const { id_categoria, codigo, nombre, descripcion, precio, stock_minimo, imagen } = req.body;
    const { id_usuario, id_empresa } = req.usuario;

    const stockMinimoFinal = (stock_minimo !== undefined && stock_minimo !== "" && !isNaN(stock_minimo)) ? stock_minimo : 5;

    try {
        const resultado = await pool.query(
            'UPDATE productos SET id_categoria = $1, codigo = $2, nombre = $3, descripcion = $4, precio = $5, stock_minimo = $6, imagen = $7 WHERE id_producto = $8 AND id_empresa = $9 RETURNING *',
            [id_categoria, codigo, nombre, descripcion, precio, stockMinimoFinal, imagen || null, id, id_empresa]
        );
        
        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado o no pertenece a tu empresa.' });
        }

        await registrarAuditoria(
            id_usuario, 
            'productos', 
            'ACTUALIZAR', 
            id, 
            `Producto actualizado: ${nombre}. Precio nuevo: ${precio}`
        );

        res.json({ 
            mensaje: 'Producto actualizado con éxito.', 
            producto: resultado.rows[0] 
        });
    } catch (error) {
        console.error("Error al actualizar producto:", error);
        res.status(500).json({ error: 'Error al actualizar el producto.' });
    }
};

export const eliminarProductoLogico = async (req, res) => {
    const { id } = req.params;
    const { id_usuario, id_empresa } = req.usuario;
    
    try {
        const resultado = await pool.query(
            'UPDATE productos SET estado = FALSE WHERE id_producto = $1 AND id_empresa = $2 RETURNING *',
            [id, id_empresa]
        );
        
        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado o no pertenece a tu empresa.' });
        }

        await registrarAuditoria(
            id_usuario, 
            'productos', 
            'ELIMINAR_LOGICO', 
            id, 
            `Producto desactivado: ${resultado.rows[0].nombre}`
        );

        res.json({ mensaje: 'Producto desactivado del inventario con éxito.' });
    } catch (error) {
        console.error("Error al eliminar producto:", error);
        res.status(500).json({ error: 'Error al eliminar el producto.' });
    }
};