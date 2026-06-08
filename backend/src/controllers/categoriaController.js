import pool from '../config/db.js';
import { registrarAuditoria } from '../config/auditoriaService.js';

export const crearCategoria = async (req, res) => {
    const { nombre, descripcion } = req.body;
    const { id_usuario } = req.usuario; 
    try {
        const categoriaExiste = await pool.query('SELECT * FROM categorias WHERE nombre = $1', [nombre]);
        if (categoriaExiste.rows.length > 0) {
            return res.status(400).json({ error: 'La categoría ya existe en el sistema.' });
        }
        const nuevaCategoria = await pool.query(
            'INSERT INTO categorias (nombre, descripcion) VALUES ($1, $2) RETURNING *',
            [nombre, descripcion]
        );
        
        await registrarAuditoria(id_usuario, 'categorias', 'CREAR', nuevaCategoria.rows[0].id_categoria, `Categoría creada: ${nombre}`);

        res.status(201).json({
            mensaje: 'Categoría creada con éxito.',
            categoria: nuevaCategoria.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear la categoría.' });
    }
};

export const obtenerCategorias = async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM categorias ORDER BY nombre ASC');
        res.json(resultado.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener las categorías.' });
    }
};
