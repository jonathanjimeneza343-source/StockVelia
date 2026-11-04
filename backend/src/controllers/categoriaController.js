import pool from '../config/db.js';
import { registrarAuditoria } from '../config/auditoriaService.js';

export const crearCategoria = async (req, res) => {
    const { nombre, descripcion } = req.body;
    const { id_usuario, id_empresa } = req.usuario; // <-- Obtenemos id_empresa directamente del token seguro

    try {
        if (!id_empresa) {
            return res.status(400).json({ error: 'No se ha seleccionado una empresa activa.' });
        }

        const categoriaExiste = await pool.query(
            'SELECT * FROM categorias WHERE nombre = $1 AND id_empresa = $2', 
            [nombre, id_empresa]
        );
        
        if (categoriaExiste.rows.length > 0) {
            return res.status(400).json({ error: 'La categoría ya existe en el sistema para esta empresa.' });
        }

        const nuevaCategoria = await pool.query(
            'INSERT INTO categorias (nombre, descripcion, id_empresa) VALUES ($1, $2, $3) RETURNING *',
            [nombre, descripcion, id_empresa]
        );
        
        await registrarAuditoria(id_usuario, 'categorias', 'CREAR', nuevaCategoria.rows[0].id_categoria, `Categoría creada: ${nombre}`);

        res.status(201).json({
            mensaje: 'Categoría creada con éxito.',
            categoria: nuevaCategoria.rows[0]
        });
    } catch (error) {
        console.error("Error al crear categoría:", error);
        res.status(500).json({ error: 'Error al crear la categoría.' });
    }
};

export const obtenerCategorias = async (req, res) => {
    try {
        const id_empresa = req.usuario?.id_empresa; // <-- Obtenemos id_empresa del token

        if (!id_empresa) {
            return res.status(400).json({ error: 'No se ha seleccionado una empresa activa.' });
        }

        const query = 'SELECT * FROM categorias WHERE id_empresa = $1 ORDER BY nombre ASC';
        const resultado = await pool.query(query, [id_empresa]);

        res.json(resultado.rows);
    } catch (error) {
        console.error("Error al obtener categorías:", error);
        res.status(500).json({ error: 'Error al obtener las categorías.' });
    }
};