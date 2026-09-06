import pool from "../config/db.js";
import bcrypt from "bcrypt";

export const listarUsuarios = async (req, res) => {
  try {
    const idEmpresa = req.query.id_empresa;

    const resultado = await pool.query(
      `
      SELECT
        id_usuario,
        nombre,
        correo,
        id_rol,
        estado
      FROM usuario
      WHERE id_empresa = $1
      ORDER BY id_usuario
      `,
      [idEmpresa],
    );

    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al obtener usuarios",
    });
  }
};

export const crearUsuario = async (req, res) => {
  try {
    const { nombre, correo, password, id_empresa } = req.body;

    if (!nombre || !correo || !password) {
      return res.status(400).json({
        error: "Todos los campos son obligatorios.",
      });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error:
          "La contraseña debe tener al menos 6 caracteres, una letra mayúscula, una minúscula y un número.",
      });
    }

    const existe = await pool.query("SELECT * FROM usuario WHERE correo = $1", [
      correo,
    ]);

    if (existe.rows.length > 0) {
      return res.status(400).json({
        error: "El correo ya está registrado",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const resultado = await pool.query(
      `
      INSERT INTO usuario
      (id_empresa, id_rol, nombre, correo, password)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [id_empresa, 2, nombre, correo, passwordHash],
    );

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al crear usuario",
    });
  }
};

export const cambiarEstadoUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `
      UPDATE usuario
      SET estado = NOT estado
      WHERE id_usuario = $1
      AND id_rol != 1
      RETURNING id_usuario, nombre, correo, id_rol, estado
      `,
      [id],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        error: "Usuario no encontrado o no se puede modificar.",
      });
    }

    res.json({
      mensaje: resultado.rows[0].estado
        ? "Usuario activado correctamente."
        : "Usuario desactivado correctamente.",
      usuario: resultado.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al cambiar el estado del usuario",
    });
  }
};
