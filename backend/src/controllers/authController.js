import crypto from "crypto";
import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transporter from "../config/mailer.js";
import { plantillaRecuperacion } from "../templates/recuperacionPassword.js";
import { registrarAuditoria } from "../config/auditoriaService.js";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
const colorHexRegex = /^#[0-9A-Fa-f]{6}$/;

async function obtenerEmpresasDeUsuario(idUsuario) {
  const result = await pool.query(
    `SELECT e.id_empresa, e.nombre AS nombre_empresa, e.color_tema
     FROM empresa e
     INNER JOIN usuario_empresa ue ON e.id_empresa = ue.id_empresa
     WHERE ue.id_usuario = $1 AND e.estado = TRUE
     ORDER BY e.id_empresa ASC`,
    [idUsuario]
  );
  return result.rows;
}

export const registrarEmpresaYUsuario = async (req, res) => {
  const {
    nombre_empresa,
    nombre_usuario,
    apellido_usuario,
    email,
    password,
    color_tema,
  } = req.body;

  if (!nombre_empresa || !email || !password) {
    return res.status(400).json({ error: "Nombre de empresa, correo y contraseña son obligatorios." });
  }

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error:
        "La contraseña debe tener al menos 6 caracteres, una letra mayúscula, una minúscula y un número.",
    });
  }

  const colorLimpio =
    color_tema && colorHexRegex.test(color_tema.trim())
      ? color_tema.trim().toUpperCase()
      : "#6D28D9";
  const correoNormalizado = email.trim().toLowerCase();

  try {
    const usuarioQuery = await pool.query(
      "SELECT * FROM usuario WHERE correo = $1 LIMIT 1",
      [correoNormalizado]
    );

    if (usuarioQuery.rows.length > 0) {
      const usuarioExistente = usuarioQuery.rows[0];
      if (usuarioExistente.estado !== "ACTIVO") {
        return res.status(403).json({
          error: "Esta cuenta está suspendida o inactiva. No es posible asociar nuevas empresas.",
        });
      }
      if (Number(usuarioExistente.id_rol) !== 1) {
        return res.status(403).json({
          error: "Solo un usuario con rol Propietario puede registrar múltiples empresas.",
        });
      }

      const passwordValida = await bcrypt.compare(password, usuarioExistente.password);
      if (!passwordValida) {
        return res.status(401).json({
          error: "Este correo ya está registrado. Ingresa tu contraseña actual para vincular la nueva empresa.",
        });
      }

      const nuevaEmpresa = await pool.query(
        "INSERT INTO empresa (nombre, correo, color_tema) VALUES ($1, $2, $3) RETURNING id_empresa, nombre, color_tema",
        [nombre_empresa.trim(), correoNormalizado, colorLimpio]
      );
      const idEmpresa = nuevaEmpresa.rows[0].id_empresa;

      await pool.query(
        "INSERT INTO usuario_empresa (id_usuario, id_empresa) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [usuarioExistente.id_usuario, idEmpresa]
      );
      await pool.query(
        "UPDATE usuario SET id_empresa = COALESCE(id_empresa, $1) WHERE id_usuario = $2",
        [idEmpresa, usuarioExistente.id_usuario]
      );

      await registrarAuditoria(
        usuarioExistente.id_usuario,
        "empresa",
        "CREAR_EMPRESA_ADICIONAL",
        idEmpresa,
        `Se vinculó la nueva empresa "${nombre_empresa.trim()}" al propietario.`
      );

      const empresasDisponibles = await obtenerEmpresasDeUsuario(usuarioExistente.id_usuario);
      const token = jwt.sign(
        {
          id_usuario: usuarioExistente.id_usuario,
          id_empresa: idEmpresa,
          id_rol: usuarioExistente.id_rol,
        },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
      );

      return res.status(201).json({
        mensaje: "Nueva empresa registrada y asociada a tu cuenta con éxito.",
        token,
        usuario: {
          id_usuario: usuarioExistente.id_usuario,
          id_empresa: idEmpresa,
          nombre: usuarioExistente.nombre,
          correo: usuarioExistente.correo,
          telefono: usuarioExistente.telefono || "",
          foto_perfil: usuarioExistente.foto_perfil || null,
          id_rol: usuarioExistente.id_rol,
          nombre_empresa: nuevaEmpresa.rows[0].nombre,
          color_tema: nuevaEmpresa.rows[0].color_tema,
          empresasDisponibles,
        },
      });
    }

    if (!nombre_usuario) {
      return res.status(400).json({ error: "El nombre del usuario es obligatorio." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordEncriptada = await bcrypt.hash(password, salt);

    const nuevaEmpresa = await pool.query(
      "INSERT INTO empresa (nombre, correo, color_tema) VALUES ($1, $2, $3) RETURNING id_empresa, nombre, color_tema",
      [nombre_empresa.trim(), correoNormalizado, colorLimpio]
    );
    const idEmpresa = nuevaEmpresa.rows[0].id_empresa;

    const nombreCompletoUsuario = `${nombre_usuario} ${apellido_usuario || ""}`.trim();
    const nuevoUsuario = await pool.query(
      `INSERT INTO usuario (id_empresa, id_rol, nombre, correo, password, estado)
       VALUES ($1, $2, $3, $4, $5, 'ACTIVO')
       RETURNING id_usuario, id_empresa, id_rol, nombre, correo, telefono, foto_perfil`,
      [idEmpresa, 1, nombreCompletoUsuario, correoNormalizado, passwordEncriptada]
    );
    const usuarioCreado = nuevoUsuario.rows[0];

    await pool.query(
      "INSERT INTO usuario_empresa (id_usuario, id_empresa) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [usuarioCreado.id_usuario, idEmpresa]
    );

    await registrarAuditoria(
      usuarioCreado.id_usuario,
      "empresa/usuario",
      "REGISTRO",
      idEmpresa,
      `Se registró la empresa ${nombre_empresa.trim()} y se asoció al usuario.`
    );

    const empresasDisponibles = await obtenerEmpresasDeUsuario(usuarioCreado.id_usuario);
    const token = jwt.sign(
      {
        id_usuario: usuarioCreado.id_usuario,
        id_empresa: idEmpresa,
        id_rol: usuarioCreado.id_rol,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.status(201).json({
      mensaje: "Empresa registrada y asociada con éxito.",
      token,
      usuario: {
        id_usuario: usuarioCreado.id_usuario,
        id_empresa: idEmpresa,
        nombre: usuarioCreado.nombre,
        correo: usuarioCreado.correo,
        telefono: usuarioCreado.telefono || "",
        foto_perfil: usuarioCreado.foto_perfil || null,
        id_rol: usuarioCreado.id_rol,
        nombre_empresa: nuevaEmpresa.rows[0].nombre,
        color_tema: nuevaEmpresa.rows[0].color_tema,
        empresasDisponibles,
      },
    });
  } catch (error) {
    console.error("Error en el registro:", error.message);
    res.status(500).json({ error: "Error interno del servidor al registrar." });
  }
};

export const loginUsuario = async (req, res) => {
  const { correo, password } = req.body;
  if (!correo || !password) {
    return res.status(400).json({ error: "Correo y contraseña requeridos." });
  }

  try {
    const resultado = await pool.query(
      "SELECT * FROM usuario WHERE correo = $1 LIMIT 1",
      [correo.trim().toLowerCase()]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "El correo electrónico no está registrado." });
    }

    const usuario = resultado.rows[0];
    if (usuario.estado !== "ACTIVO") {
      return res.status(403).json({
        error:
          usuario.estado === "ELIMINADO"
            ? "Esta cuenta ha sido dada de baja."
            : "Esta cuenta está suspendida o inactiva.",
      });
    }

    if (usuario.bloqueo_hasta && new Date(usuario.bloqueo_hasta) > new Date()) {
      return res.status(423).json({ error: "Cuenta bloqueada temporalmente." });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      const nuevosIntentos = (usuario.intentos_fallidos || 0) + 1;
      if (nuevosIntentos >= 5) {
        const tiempoBloqueo = new Date(Date.now() + 15 * 60 * 1000);
        await pool.query(
          "UPDATE usuario SET intentos_fallidos = $1, bloqueo_hasta = $2 WHERE id_usuario = $3",
          [nuevosIntentos, tiempoBloqueo, usuario.id_usuario]
        );
        return res.status(423).json({ error: "Demasiados intentos fallidos. Cuenta bloqueada." });
      } else {
        await pool.query(
          "UPDATE usuario SET intentos_fallidos = $1 WHERE id_usuario = $2",
          [nuevosIntentos, usuario.id_usuario]
        );
        return res.status(401).json({ error: "Contraseña incorrecta." });
      }
    }

    await pool.query(
      "UPDATE usuario SET intentos_fallidos = 0, bloqueo_hasta = NULL WHERE id_usuario = $1",
      [usuario.id_usuario]
    );

    const empresas = await obtenerEmpresasDeUsuario(usuario.id_usuario);
    const empresaPreferida = empresas.find((e) => Number(e.id_empresa) === Number(usuario.id_empresa));
    const empresaActivaId = empresaPreferida
      ? empresaPreferida.id_empresa
      : empresas.length > 0
        ? empresas[0].id_empresa
        : usuario.id_empresa;
    const empresaActualObj = empresas.find((e) => Number(e.id_empresa) === Number(empresaActivaId));

    let nombreEmpresaActiva = empresaActualObj?.nombre_empresa || "StockVelia";
    let colorTemaActivo = empresaActualObj?.color_tema || "#6D28D9";

    if (!empresaActualObj && empresaActivaId) {
      const empFallback = await pool.query(
        "SELECT nombre, color_tema FROM empresa WHERE id_empresa = $1 LIMIT 1",
        [empresaActivaId]
      );
      if (empFallback.rows.length > 0) {
        nombreEmpresaActiva = empFallback.rows[0].nombre;
        colorTemaActivo = empFallback.rows[0].color_tema || "#6D28D9";
      }
    }

    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        id_empresa: empresaActivaId,
        id_rol: usuario.id_rol,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    await registrarAuditoria(
      usuario.id_usuario,
      "usuario",
      "LOGIN",
      empresaActivaId,
      "Inicio de sesión exitoso."
    );

    res.json({
      mensaje: "Inicio de sesión exitoso.",
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        id_empresa: empresaActivaId,
        nombre: usuario.nombre,
        correo: usuario.correo,
        telefono: usuario.telefono || "",
        foto_perfil: usuario.foto_perfil || null,
        id_rol: usuario.id_rol,
        estado: usuario.estado,
        nombre_empresa: nombreEmpresaActiva,
        color_tema: colorTemaActivo,
        empresasDisponibles: empresas,
      },
    });
  } catch (error) {
    console.error("Error en el login:", error.message);
    res.status(500).json({ error: "Error interno del servidor al iniciar sesión." });
  }
};

export const cambiarEmpresaActiva = async (req, res) => {
  const { id_empresa } = req.body;
  const id_usuario = req.usuario.id_usuario;

  try {
    const pertenece = await pool.query(
      `SELECT e.id_empresa, e.nombre, e.color_tema
       FROM usuario_empresa ue
       INNER JOIN empresa e ON ue.id_empresa = e.id_empresa
       WHERE ue.id_usuario = $1 AND ue.id_empresa = $2 AND e.estado = TRUE`,
      [id_usuario, id_empresa]
    );

    if (pertenece.rows.length === 0) {
      return res.status(403).json({ error: "No tienes permiso para acceder a esta empresa." });
    }

    const empresaNueva = pertenece.rows[0];
    const usuarioQuery = await pool.query(
      "SELECT id_usuario, id_rol FROM usuario WHERE id_usuario = $1 LIMIT 1",
      [id_usuario]
    );
    const usuario = usuarioQuery.rows[0];

    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        id_empresa: Number(empresaNueva.id_empresa),
        id_rol: usuario.id_rol,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      mensaje: "Empresa cambiada con éxito.",
      token,
      id_empresa: Number(empresaNueva.id_empresa),
      nombre_empresa: empresaNueva.nombre,
      color_tema: empresaNueva.color_tema || "#6D28D9",
    });
  } catch (error) {
    console.error("Error al cambiar de empresa:", error.message);
    res.status(500).json({ error: "Error interno al cambiar de empresa." });
  }
};

export const solicitarRecuperacion = async (req, res) => {
  const { correo } = req.body;
  if (!correo) {
    return res.status(400).json({ error: "El correo electrónico es obligatorio." });
  }

  const correoNormalizado = correo.trim().toLowerCase();
  try {
    const usuarioExiste = await pool.query(
      "SELECT 1 FROM usuario WHERE correo = $1 LIMIT 1",
      [correoNormalizado]
    );
    if (usuarioExiste.rows.length === 0) {
      return res.status(404).json({ error: "El correo electrónico no está registrado." });
    }

    const codigo = crypto.randomInt(100000, 1000000).toString();
    const expiraEn = new Date(Date.now() + 15 * 60 * 1000);

    await pool.query("DELETE FROM codigos_recuperacion WHERE correo = $1", [correoNormalizado]);
    await pool.query(
      "INSERT INTO codigos_recuperacion (correo, codigo, expira_en) VALUES ($1, $2, $3)",
      [correoNormalizado, codigo, expiraEn]
    );

    const opcionesCorreo = {
      from: `"StockVelia" <${process.env.EMAIL_USER}>`,
      to: correoNormalizado,
      subject: "Código de recuperación de contraseña - StockVelia",
      html: plantillaRecuperacion(codigo),
    };

    await transporter.sendMail(opcionesCorreo);
    res.json({ mensaje: "Código de verificación enviado al correo electrónico." });
  } catch (error) {
    console.error("Error al solicitar recuperación:", error.message);
    res.status(500).json({ error: "Error al enviar el código de recuperación." });
  }
};

export const restablecerPassword = async (req, res) => {
  const { correo, codigo, nuevaPassword } = req.body;
  if (!correo || !codigo || !nuevaPassword) {
    return res.status(400).json({ error: "Todos los campos son obligatorios." });
  }

  if (!passwordRegex.test(nuevaPassword)) {
    return res.status(400).json({
      error:
        "La contraseña debe tener al menos 6 caracteres, una letra mayúscula, una minúscula y un número.",
    });
  }

  const correoNormalizado = correo.trim().toLowerCase();
  try {
    const resultadoCodigo = await pool.query(
      "SELECT * FROM codigos_recuperacion WHERE correo = $1",
      [correoNormalizado]
    );
    if (resultadoCodigo.rows.length === 0) {
      return res.status(400).json({ error: "No hay una solicitud de recuperación activa o el código expiró." });
    }

    const registroCodigo = resultadoCodigo.rows[0];
    if (new Date(registroCodigo.expira_en) < new Date()) {
      await pool.query("DELETE FROM codigos_recuperacion WHERE correo = $1", [correoNormalizado]);
      return res.status(400).json({ error: "El código de verificación ha expirado." });
    }

    if (registroCodigo.codigo !== String(codigo).trim()) {
      await pool.query("DELETE FROM codigos_recuperacion WHERE correo = $1", [correoNormalizado]);
      return res.status(400).json({ error: "Código incorrecto. Por seguridad, solicita uno nuevo." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordEncriptada = await bcrypt.hash(nuevaPassword, salt);

    await pool.query(
      "UPDATE usuario SET password = $1, intentos_fallidos = 0, bloqueo_hasta = NULL WHERE correo = $2",
      [passwordEncriptada, correoNormalizado]
    );
    await pool.query("DELETE FROM codigos_recuperacion WHERE correo = $1", [correoNormalizado]);

    res.json({ mensaje: "Contraseña restablecida con éxito." });
  } catch (error) {
    console.error("Error al restablecer contraseña:", error.message);
    res.status(500).json({ error: "Error interno del servidor al cambiar la contraseña." });
  }
};

export const logoutUsuario = async (req, res) => {
  try {
    const tokenHeader = req.header("Authorization");
    const token = (
      tokenHeader.startsWith("Bearer ") ? tokenHeader.slice(7) : tokenHeader
    ).trim();

    const decoded = req.usuario;
    const fechaExpiracion = decoded.exp
      ? new Date(decoded.exp * 1000)
      : new Date(Date.now() + 2 * 60 * 60 * 1000);

    const existe = await pool.query(
      `SELECT 1 FROM tokens_blacklist WHERE token = $1 LIMIT 1`,
      [token],
    );

    if (existe.rows.length === 0) {
      await pool.query(
        `INSERT INTO tokens_blacklist (token, fecha_expiracion)
         VALUES ($1, $2)`,
        [token, fechaExpiracion],
      );
    }

    res.json({ mensaje: "Sesión cerrada con éxito. Token revocado." });
  } catch (error) {
    console.error("Error al cerrar sesión:", error.message);
    res.status(500).json({ error: "Error al cerrar sesión." });
  }
};