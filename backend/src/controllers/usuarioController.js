import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import pool from "../config/db.js";
import { registrarAuditoria } from "../config/auditoriaService.js";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

async function obtenerNombreRolPorId(idRol, db = pool) {
  const res = await db.query(
    "SELECT nombre FROM public.roles WHERE id_rol = $1 LIMIT 1",
    [idRol]
  );
  return res.rows[0]?.nombre || null;
}

export const obtenerMiPerfil = async (req, res) => {
  const { id_usuario, id_empresa } = req.usuario;
  try {
    const resultado = await pool.query(
      `SELECT
         u.id_usuario,
         u.nombre,
         u.correo,
         u.telefono,
         u.foto_perfil,
         u.id_rol,
         r.nombre AS nombre_rol,
         u.estado,
         e.id_empresa,
         e.nombre AS nombre_empresa,
         COALESCE(e.color_tema, '#6D28D9') AS color_tema
       FROM public.usuario u
       LEFT JOIN public.roles r ON r.id_rol = u.id_rol
       INNER JOIN public.empresa e ON e.id_empresa = $2
       WHERE u.id_usuario = $1
       LIMIT 1`,
      [id_usuario, id_empresa]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Perfil de usuario no encontrado." });
    }

    return res.json(resultado.rows[0]);
  } catch (error) {
    console.error("Error al obtener perfil:", error.message);
    return res
      .status(500)
      .json({ error: "Error interno al consultar el perfil." });
  }
};

export const actualizarMiPerfil = async (req, res) => {
  const { id_usuario, id_empresa } = req.usuario;
  const { nombre, telefono, passwordActual, nuevaPassword } = req.body;

  if (!nombre || !nombre.trim()) {
    return res
      .status(400)
      .json({ error: "El nombre completo es obligatorio." });
  }

  const nombreLimpio = nombre.trim();
  const telefonoLimpio =
    telefono !== undefined && telefono !== null ? String(telefono).trim() : null;

  if (telefonoLimpio && !/^[0-9+\-\s()]{7,20}$/.test(telefonoLimpio)) {
    return res.status(400).json({
      error:
        "El formato del teléfono no es válido (7 a 20 caracteres numéricos).",
    });
  }

  try {
    const usuarioQuery = await pool.query(
      "SELECT id_usuario, nombre, telefono, password, estado FROM public.usuario WHERE id_usuario = $1 LIMIT 1",
      [id_usuario]
    );

    if (usuarioQuery.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    const usuarioActual = usuarioQuery.rows[0];
    if (usuarioActual.estado !== "ACTIVO") {
      return res.status(403).json({
        error: "Tu cuenta no se encuentra activa para realizar modificaciones.",
      });
    }

    let passwordFinal = usuarioActual.password;

    if (nuevaPassword || passwordActual) {
      if (!passwordActual || !nuevaPassword) {
        return res.status(400).json({
          error:
            "Para cambiar la contraseña debes ingresar tu contraseña actual y la nueva.",
        });
      }
      const coincide = await bcrypt.compare(
        passwordActual,
        usuarioActual.password
      );
      if (!coincide) {
        return res
          .status(401)
          .json({ error: "La contraseña actual es incorrecta." });
      }
      if (!passwordRegex.test(nuevaPassword)) {
        return res.status(400).json({
          error:
            "La nueva contraseña debe tener al menos 6 caracteres, una mayúscula, una minúscula y un número.",
        });
      }
      const salt = await bcrypt.genSalt(10);
      passwordFinal = await bcrypt.hash(nuevaPassword, salt);
    }

    const actualizado = await pool.query(
      `UPDATE public.usuario
       SET nombre = $1, telefono = $2, password = $3
       WHERE id_usuario = $4
       RETURNING id_usuario, nombre, correo, telefono, foto_perfil, id_rol, estado`,
      [nombreLimpio, telefonoLimpio || null, passwordFinal, id_usuario]
    );

    const perfil = actualizado.rows[0];
    const nombreRol = await obtenerNombreRolPorId(perfil.id_rol);

    await registrarAuditoria(
      id_usuario,
      "usuario",
      "ACTUALIZAR_PERFIL",
      id_empresa,
      `Actualizó su perfil personal${nuevaPassword ? " (incluyendo cambio de contraseña)" : ""
      }.`
    );

    return res.json({
      mensaje: "Perfil actualizado con éxito.",
      usuario: {
        ...perfil,
        nombre_rol: nombreRol,
      },
    });
  } catch (error) {
    console.error("Error al actualizar perfil:", error.message);
    return res
      .status(500)
      .json({ error: "Error interno al actualizar el perfil." });
  }
};

export const actualizarFotoPerfil = async (req, res) => {
  const { id_usuario, id_empresa } = req.usuario;
  if (!req.file) {
    return res
      .status(400)
      .json({ error: "Debes seleccionar una imagen válida." });
  }

  const rutaRelativa = `/uploads/avatars/${req.file.filename}`;
  try {
    const anteriorQuery = await pool.query(
      "SELECT foto_perfil, estado FROM public.usuario WHERE id_usuario = $1 LIMIT 1",
      [id_usuario]
    );

    if (anteriorQuery.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }
    if (anteriorQuery.rows[0].estado !== "ACTIVO") {
      return res.status(403).json({
        error:
          "Tu cuenta está suspendida o inactiva y no puede modificar su foto.",
      });
    }

    const fotoAnterior = anteriorQuery.rows[0]?.foto_perfil;

    await pool.query(
      "UPDATE public.usuario SET foto_perfil = $1 WHERE id_usuario = $2",
      [rutaRelativa, id_usuario]
    );

    if (fotoAnterior && fotoAnterior.startsWith("/uploads/avatars/")) {
      const rutaFisicaAnterior = path.resolve(fotoAnterior.replace(/^\//, ""));
      if (fs.existsSync(rutaFisicaAnterior)) {
        fs.unlink(rutaFisicaAnterior, () => { });
      }
    }

    await registrarAuditoria(
      id_usuario,
      "usuario",
      "ACTUALIZAR_FOTO_PERFIL",
      id_empresa,
      "Actualizó su fotografía de perfil."
    );

    return res.json({
      mensaje: "Foto de perfil actualizada con éxito.",
      foto_perfil: rutaRelativa,
    });
  } catch (error) {
    console.error("Error al actualizar foto de perfil:", error.message);
    return res
      .status(500)
      .json({ error: "Error interno al guardar la foto de perfil." });
  }
};

export const crearEmpresa = async (req, res) => {
  const { id_usuario, id_rol } = req.usuario;
  const { nombre, correo, color_tema } = req.body;

  if (Number(id_rol) !== 1) {
    return res.status(403).json({
      error: "Solo un usuario con rol Propietario puede crear nuevas empresas.",
    });
  }

  if (!nombre || !String(nombre).trim()) {
    return res
      .status(400)
      .json({ error: "El nombre de la empresa es obligatorio." });
  }

  const nombreLimpio = String(nombre).trim();
  const colorLimpio =
    color_tema && hexColorRegex.test(String(color_tema).trim())
      ? String(color_tema).trim().toUpperCase()
      : "#6D28D9";

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const usuarioQuery = await client.query(
      "SELECT id_usuario, correo, estado, id_empresa FROM public.usuario WHERE id_usuario = $1 LIMIT 1",
      [id_usuario]
    );

    if (usuarioQuery.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    const usuarioActual = usuarioQuery.rows[0];
    if (usuarioActual.estado !== "ACTIVO") {
      await client.query("ROLLBACK");
      return res.status(403).json({
        error: "Tu cuenta está inactiva o suspendida y no puede crear empresas.",
      });
    }

    const correoEmpresa =
      correo && String(correo).trim()
        ? String(correo).trim().toLowerCase()
        : usuarioActual.correo;

    const nuevaEmpresaRes = await client.query(
      `INSERT INTO public.empresa (nombre, correo, color_tema, estado)
       VALUES ($1, $2, $3, TRUE)
       RETURNING id_empresa, nombre, correo, color_tema, fecha_registro, estado`,
      [nombreLimpio, correoEmpresa, colorLimpio]
    );

    const nuevaEmpresa = nuevaEmpresaRes.rows[0];

    await client.query(
      `INSERT INTO public.usuario_empresa (id_usuario, id_empresa)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [id_usuario, nuevaEmpresa.id_empresa]
    );

    if (!usuarioActual.id_empresa) {
      await client.query(
        "UPDATE public.usuario SET id_empresa = $1 WHERE id_usuario = $2",
        [nuevaEmpresa.id_empresa, id_usuario]
      );
    }

    await registrarAuditoria(
      id_usuario,
      "empresa",
      "CREAR_EMPRESA",
      nuevaEmpresa.id_empresa,
      `Creó la empresa "${nombreLimpio}" con color ${colorLimpio}.`
    );

    await client.query("COMMIT");

    return res.status(201).json({
      mensaje: "Empresa creada y vinculada a tu cuenta con éxito.",
      empresa: {
        ...nuevaEmpresa,
        nombre_empresa: nuevaEmpresa.nombre,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al crear empresa:", error.message);
    return res
      .status(500)
      .json({ error: "Error interno al crear la empresa." });
  } finally {
    client.release();
  }
};

export const actualizarColorEmpresa = async (req, res) => {
  const { id_usuario, id_empresa, id_rol } = req.usuario;
  const { color_tema } = req.body;

  if (Number(id_rol) !== 1) {
    return res.status(403).json({
      error: "Solo el Propietario puede personalizar el color de la empresa.",
    });
  }

  if (!color_tema || !hexColorRegex.test(color_tema.trim())) {
    return res.status(400).json({
      error: "El color debe estar en formato hexadecimal válido (ej. #6D28D9).",
    });
  }

  const colorNormalizado = color_tema.trim().toUpperCase();
  try {
    const pertenece = await pool.query(
      "SELECT 1 FROM public.usuario_empresa WHERE id_usuario = $1 AND id_empresa = $2 LIMIT 1",
      [id_usuario, id_empresa]
    );
    if (pertenece.rows.length === 0) {
      return res
        .status(403)
        .json({ error: "No tienes acceso a esta empresa." });
    }

    const resultado = await pool.query(
      `UPDATE public.empresa
       SET color_tema = $1
       WHERE id_empresa = $2
       RETURNING id_empresa, nombre AS nombre_empresa, color_tema`,
      [colorNormalizado, id_empresa]
    );

    await registrarAuditoria(
      id_usuario,
      "empresa",
      "ACTUALIZAR_COLOR_TEMA",
      id_empresa,
      `Cambió el color corporativo de la empresa a ${colorNormalizado}.`
    );

    return res.json({
      mensaje: "Color de la empresa actualizado con éxito.",
      empresa: resultado.rows[0],
    });
  } catch (error) {
    console.error("Error al actualizar color de empresa:", error.message);
    return res
      .status(500)
      .json({ error: "Error interno al actualizar el color de la empresa." });
  }
};

export const listarUsuariosEmpresa = async (req, res) => {
  const { id_empresa } = req.usuario;
  try {
    const resultado = await pool.query(
      `SELECT
         u.id_usuario,
         u.nombre,
         u.correo,
         u.telefono,
         u.foto_perfil,
         u.id_rol,
         r.nombre AS nombre_rol,
         u.estado
       FROM public.usuario u
       INNER JOIN public.usuario_empresa ue ON u.id_usuario = ue.id_usuario
       LEFT JOIN public.roles r ON r.id_rol = u.id_rol
       WHERE ue.id_empresa = $1 AND u.estado <> 'ELIMINADO'
       ORDER BY u.id_rol ASC, u.nombre ASC`,
      [id_empresa]
    );
    return res.json(resultado.rows);
  } catch (error) {
    console.error("Error al listar usuarios:", error.message);
    return res
      .status(500)
      .json({ error: "Error interno al obtener los usuarios." });
  }
};

export const crearUsuarioPorAdmin = async (req, res) => {
  const { id_usuario: idAutor, id_empresa, id_rol: rolAutor } = req.usuario;
  const { nombre, correo, telefono, password, id_rol } = req.body;

  if (!nombre || !nombre.trim() || !correo || !correo.trim() || !password) {
    return res.status(400).json({
      error: "Nombre, correo y contraseña inicial son obligatorios.",
    });
  }

  const nombreLimpio = nombre.trim();
  const correoLimpio = correo.trim().toLowerCase();
  const telefonoLimpio =
    telefono !== undefined && telefono !== null && String(telefono).trim() !== ""
      ? String(telefono).trim()
      : null;

  if (telefonoLimpio && !/^[0-9+\-\s()]{7,20}$/.test(telefonoLimpio)) {
    return res.status(400).json({
      error:
        "El formato del teléfono no es válido (7 a 20 caracteres numéricos).",
    });
  }

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error:
        "La contraseña debe tener al menos 6 caracteres, una mayúscula, una minúscula y un número.",
    });
  }

  let rolDestino = 3;
  if (id_rol !== undefined && id_rol !== null) {
    const rolSolicitado = Number(id_rol);
    if (rolSolicitado === 1) {
      return res.status(403).json({
        error: "No está permitido crear usuarios con rol Propietario.",
      });
    }
    if (rolSolicitado === 2 && Number(rolAutor) !== 1) {
      return res.status(403).json({
        error:
          "Solo el Propietario puede asignar el rol de Administrador Operativo.",
      });
    }
    if (![2, 3].includes(rolSolicitado)) {
      return res.status(400).json({ error: "Rol asignado no válido." });
    }
    rolDestino = rolSolicitado;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const rolValido = await client.query(
      "SELECT id_rol, nombre FROM public.roles WHERE id_rol = $1 LIMIT 1",
      [rolDestino]
    );
    if (rolValido.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: "El rol seleccionado no existe en la tabla roles.",
      });
    }
    const nombreRolDestino = rolValido.rows[0].nombre;

    const existente = await client.query(
      "SELECT id_usuario FROM public.usuario WHERE LOWER(correo) = $1 LIMIT 1",
      [correoLimpio]
    );
    if (existente.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        error: "Ya existe un usuario registrado con ese correo electrónico.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const insertado = await client.query(
      `INSERT INTO public.usuario (id_empresa, id_rol, nombre, correo, telefono, password, estado)
       VALUES ($1, $2, $3, $4, $5, $6, 'ACTIVO')
       RETURNING id_usuario, id_empresa, nombre, correo, telefono, foto_perfil, id_rol, estado`,
      [
        id_empresa,
        rolDestino,
        nombreLimpio,
        correoLimpio,
        telefonoLimpio,
        passwordHash,
      ]
    );

    const nuevoUsuario = insertado.rows[0];

    await client.query(
      `INSERT INTO public.usuario_empresa (id_usuario, id_empresa)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [nuevoUsuario.id_usuario, id_empresa]
    );

    await registrarAuditoria(
      idAutor,
      "usuario",
      "CREAR_USUARIO",
      id_empresa,
      `Creó al usuario #${nuevoUsuario.id_usuario} (${correoLimpio}) con rol ${nombreRolDestino}.`
    );

    await client.query("COMMIT");

    return res.status(201).json({
      mensaje: "Usuario creado con éxito.",
      usuario: {
        ...nuevoUsuario,
        nombre_rol: nombreRolDestino,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al crear usuario:", error.message);
    return res
      .status(500)
      .json({ error: "Error interno al crear el usuario." });
  } finally {
    client.release();
  }
};

export const actualizarUsuarioPorAdmin = async (req, res) => {
  const { id_usuario: idAutor, id_empresa, id_rol: rolAutor } = req.usuario;
  const idObjetivo = Number(req.params.id);
  const { nombre, correo, telefono, id_rol: nuevoRol } = req.body;

  try {
    const objetivoQuery = await pool.query(
      `SELECT u.*
       FROM public.usuario u
       INNER JOIN public.usuario_empresa ue ON u.id_usuario = ue.id_usuario
       WHERE u.id_usuario = $1 AND ue.id_empresa = $2
       LIMIT 1`,
      [idObjetivo, id_empresa]
    );
    if (objetivoQuery.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Usuario no encontrado en esta empresa." });
    }

    const objetivo = objetivoQuery.rows[0];
    if (objetivo.estado !== "ACTIVO") {
      return res.status(403).json({
        error:
          "No se puede editar un usuario inactivo o dado de baja. Actívalo primero.",
      });
    }
    if (objetivo.id_rol === 1) {
      return res
        .status(403)
        .json({ error: "No está permitido modificar al Propietario." });
    }
    if (rolAutor === 2 && objetivo.id_rol !== 3) {
      return res.status(403).json({
        error:
          "Un Administrador Operativo solo puede gestionar perfiles de Empleados.",
      });
    }

    let rolFinal = objetivo.id_rol;
    if (nuevoRol !== undefined && Number(nuevoRol) !== objetivo.id_rol) {
      if (rolAutor !== 1) {
        return res.status(403).json({
          error: "Solo el Propietario puede modificar el rol de un usuario.",
        });
      }
      if (![2, 3].includes(Number(nuevoRol))) {
        return res.status(400).json({
          error:
            "Rol destino inválido. Solo se permite Administrador Operativo o Empleado.",
        });
      }
      rolFinal = Number(nuevoRol);
    }

    const nombreFinal = nombre?.trim() || objetivo.nombre;
    const correoFinal = correo?.trim().toLowerCase() || objetivo.correo;
    const telefonoFinal =
      telefono !== undefined
        ? String(telefono).trim() || null
        : objetivo.telefono;

    const actualizado = await pool.query(
      `UPDATE public.usuario
       SET nombre = $1, correo = $2, telefono = $3, id_rol = $4
       WHERE id_usuario = $5
       RETURNING id_usuario, nombre, correo, telefono, foto_perfil, id_rol, estado`,
      [nombreFinal, correoFinal, telefonoFinal, rolFinal, idObjetivo]
    );

    const usuarioActualizado = actualizado.rows[0];
    const nombreRolActualizado = await obtenerNombreRolPorId(
      usuarioActualizado.id_rol
    );

    await registrarAuditoria(
      idAutor,
      "usuario",
      "EDITAR_USUARIO",
      id_empresa,
      `Editó al usuario #${idObjetivo}: nombre (${objetivo.nombre} -> ${nombreFinal}), rol (${objetivo.id_rol} -> ${rolFinal}).`
    );

    return res.json({
      mensaje: "Usuario actualizado con éxito.",
      usuario: {
        ...usuarioActualizado,
        nombre_rol: nombreRolActualizado,
      },
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error.message);
    return res
      .status(500)
      .json({ error: "Error interno al actualizar el usuario." });
  }
};

export const cambiarEstadoUsuario = async (req, res) => {
  const { id_usuario: idAutor, id_empresa, id_rol: rolAutor } = req.usuario;
  const idObjetivo = Number(req.params.id);
  const { estado } = req.body;
  const estadoNormalizado = String(estado || "").toUpperCase();

  if (!["ACTIVO", "INACTIVO", "ELIMINADO"].includes(estadoNormalizado)) {
    return res.status(400).json({
      error:
        "Estado inválido. Valores permitidos: ACTIVO, INACTIVO o ELIMINADO.",
    });
  }

  try {
    const objetivoQuery = await pool.query(
      `SELECT u.*
       FROM public.usuario u
       INNER JOIN public.usuario_empresa ue ON u.id_usuario = ue.id_usuario
       WHERE u.id_usuario = $1 AND ue.id_empresa = $2
       LIMIT 1`,
      [idObjetivo, id_empresa]
    );
    if (objetivoQuery.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Usuario no encontrado en esta empresa." });
    }

    const objetivo = objetivoQuery.rows[0];
    if (objetivo.id_rol === 1 || idObjetivo === idAutor) {
      return res.status(403).json({
        error:
          "No puedes suspender ni dar de baja al Propietario o a tu propia cuenta.",
      });
    }
    if (rolAutor === 2 && objetivo.id_rol !== 3) {
      return res.status(403).json({
        error:
          "Un Administrador Operativo solo puede suspender o dar de baja a Empleados.",
      });
    }

    await pool.query(
      "UPDATE public.usuario SET estado = $1 WHERE id_usuario = $2",
      [estadoNormalizado, idObjetivo]
    );

    await registrarAuditoria(
      idAutor,
      "usuario",
      `ESTADO_${estadoNormalizado}`,
      id_empresa,
      `Cambió estado del usuario #${idObjetivo} (${objetivo.correo}) de ${objetivo.estado} a ${estadoNormalizado}.`
    );

    return res.json({
      mensaje:
        estadoNormalizado === "ELIMINADO"
          ? "Usuario dado de baja lógica correctamente."
          : `Estado del usuario actualizado a ${estadoNormalizado}.`,
    });
  } catch (error) {
    console.error("Error al cambiar estado del usuario:", error.message);
    return res
      .status(500)
      .json({ error: "Error interno al cambiar el estado del usuario." });
  }
};

export const eliminarUsuarioLogico = async (req, res) => {
  req.body = { ...req.body, estado: "ELIMINADO" };
  return cambiarEstadoUsuario(req, res);
};