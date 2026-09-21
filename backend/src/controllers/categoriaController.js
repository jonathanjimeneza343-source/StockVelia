import pool from '../config/db.js';
import { registrarAuditoria } from '../config/auditoriaService.js';

export const crearCategoria = async (req, res) => {
    const { nombre, descripcion, id_empresa } = req.body;
    const { id_usuario } = req.usuario; 

    try {
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
        console.error(error);
        res.status(500).json({ error: 'Error al crear la categoría.' });
    }
};

export const obtenerCategorias = async (req, res) => {
    try {
        const { id_empresa } = req.query;

        let query = 'SELECT * FROM categorias';
        let params = [];

        if (id_empresa) {
            query += ' WHERE id_empresa = $1';
            params.push(id_empresa);
        }

        query += ' ORDER BY nombre ASC';

        const resultado = await pool.query(query, params);
        res.json(resultado.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener las categorías.' });
    }
};