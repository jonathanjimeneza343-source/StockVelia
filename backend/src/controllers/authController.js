import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transporter from "../config/mailer.js";
import { plantillaRecuperacion } from "../templates/recuperacionPassword.js";
import { registrarAuditoria } from "../config/auditoriaService.js";

export const registrarEmpresaYUsuario = async (req, res) => {
  const { nombre_empresa, nombre_usuario, apellido_usuario, email, password } =
    req.body;

  try {
    const usuarioExiste = await pool.query(
      "SELECT * FROM usuario WHERE correo = $1",
      [email],
    );
    let idUsuario;

    const salt = await bcrypt.genSalt(10);
    const passwordEncriptada = await bcrypt.hash(password, salt);

    // 1. Crear la nueva empresa
    const nuevaEmpresa = await pool.query(
      "INSERT INTO empresa (nombre, correo) VALUES ($1, $2) RETURNING id_empresa",
      [nombre_empresa, email],
    );
    const idEmpresa = nuevaEmpresa.rows[0].id_empresa;
    const nombreCompletoUsuario = `${nombre_usuario} ${apellido_usuario}`.trim();

    if (usuarioExiste.rows.length > 0) {
      idUsuario = usuarioExiste.rows[0].id_usuario;
    } else {
      const nuevoUsuario = await pool.query(
        "INSERT INTO usuario (id_empresa, id_rol, nombre, correo, password) VALUES ($1, $2, $3, $4, $5) RETURNING id_usuario, nombre, correo",
        [idEmpresa, 1, nombreCompletoUsuario, email, passwordEncriptada],
      );
      idUsuario = nuevoUsuario.rows[0].id_usuario;
    }

    // 2. Insertar en la tabla intermedia usuario_empresa
    await pool.query(
      "INSERT INTO usuario_empresa (id_usuario, id_empresa) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [idUsuario, idEmpresa]
    );

    await registrarAuditoria(
      idUsuario,
      "empresa/usuario",
      "REGISTRO",
      idEmpresa,
      `Se registró la empresa ${nombre_empresa} y se asoció al usuario.`,
    );

    res.status(201).json({
      mensaje: "Empresa registrada y asociada con éxito.",
    });
  } catch (error) {
    console.error("Error en el registro:", error);
    res.status(500).json({ error: "Error interno del servidor al registrar." });
  }
};

export const loginUsuario = async (req, res) => {
  const { correo, password } = req.body;

  try {
    const resultado = await pool.query(
      `SELECT * FROM usuario WHERE correo = $1`,
      [correo],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "El correo electrónico no está registrado." });
    }

    const usuario = resultado.rows[0];

    if (!usuario.estado) {
      return res.status(403).json({ error: "Esta cuenta está desactivada." });
    }

    if (usuario.bloqueo_hasta && new Date(usuario.bloqueo_hasta) > new Date()) {
      return res.status(423).json({ error: "Cuenta bloqueada temporalmente." });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      const nuevosIntentos = usuario.intentos_fallidos + 1;
      if (nuevosIntentos >= 5) {
        const tiempoBloqueo = new Date(Date.now() + 15 * 60 * 1000);
        await pool.query(
          "UPDATE usuario SET intentos_fallidos = $1, bloqueo_hasta = $2 WHERE id_usuario = $3",
          [nuevosIntentos, tiempoBloqueo, usuario.id_usuario],
        );
        return res.status(423).json({ error: "Demasiados intentos fallidos. Cuenta bloqueada." });
      } else {
        await pool.query(
          "UPDATE usuario SET intentos_fallidos = $1 WHERE id_usuario = $2",
          [nuevosIntentos, usuario.id_usuario],
        );
        return res.status(401).json({ error: "Contraseña incorrecta." });
      }
    }

    await pool.query(
      "UPDATE usuario SET intentos_fallidos = 0, bloqueo_hasta = NULL WHERE id_usuario = $1",
      [usuario.id_usuario],
    );

    // Obtener todas las empresas del usuario
    const empresasQuery = await pool.query(
      `SELECT e.id_empresa, e.nombre AS nombre_empresa
       FROM empresa e
       INNER JOIN usuario_empresa ue ON e.id_empresa = ue.id_empresa
       WHERE ue.id_usuario = $1`,
      [usuario.id_usuario]
    );

    const empresas = empresasQuery.rows;
    // CORREGIDO AQUÍ: Usamos [0] para evitar el error de tipo integer con undefined
    const empresaActiva = empresas.length > 0 ? empresas[0].id_empresa : usuario.id_empresa;
    
    const empresaActualObj = empresas.find(e => e.id_empresa === empresaActiva);
    const nombreEmpresaActiva = empresaActualObj ? empresaActualObj.nombre_empresa : "StockVelia";

    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        id_empresa: empresaActiva,
        id_rol: usuario.id_rol,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" },
    );

    await registrarAuditoria(
      usuario.id_usuario,
      "usuario",
      "LOGIN",
      empresaActiva,
      "Inicio de sesión exitoso.",
    );

    res.json({
      mensaje: "Inicio de sesión exitoso.",
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        id_empresa: empresaActiva,
        nombre: usuario.nombre,
        correo: usuario.correo,
        id_rol: usuario.id_rol,
        nombre_empresa: nombreEmpresaActiva,
        empresasDisponibles: empresas,
      },
    });
  } catch (error) {
    console.error("Error en el login:", error);
    res.status(500).json({ error: "Error interno del servidor al iniciar sesión." });
  }
};

export const cambiarEmpresaActiva = async (req, res) => {
  const { id_empresa } = req.body;
  const id_usuario = req.usuario.id_usuario;

  try {
    const pertenece = await pool.query(
      "SELECT e.nombre FROM usuario_empresa ue INNER JOIN empresa e ON ue.id_empresa = e.id_empresa WHERE ue.id_usuario = $1 AND ue.id_empresa = $2",
      [id_usuario, id_empresa]
    );

    if (pertenece.rows.length === 0) {
      return res.status(403).json({ error: "No tienes permiso para acceder a esta empresa." });
    }

    const nombreEmpresaNueva = pertenece.rows[0].nombre;
    const usuarioQuery = await pool.query("SELECT * FROM usuario WHERE id_usuario = $1", [id_usuario]);
    const usuario = usuarioQuery.rows[0];

    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        id_empresa: Number(id_empresa),
        id_rol: usuario.id_rol,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" },
    );

    res.json({
      mensaje: "Empresa cambiada con éxito.",
      token,
      id_empresa: Number(id_empresa),
      nombre_empresa: nombreEmpresaNueva
    });
  } catch (error) {
    console.error("Error al cambiar de empresa:", error);
    res.status(500).json({ error: "Error interno al cambiar de empresa." });
  }
};

export const solicitarRecuperacion = async (req, res) => {
  const { correo } = req.body;
  try {
    const usuarioExiste = await pool.query("SELECT * FROM usuario WHERE correo = $1", [correo]);
    if (usuarioExiste.rows.length === 0) {
      return res.status(404).json({ error: "El correo electrónico no está registrado." });
    }
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const expiraEn = new Date(Date.now() + 15 * 60 * 1000);
    await pool.query("DELETE FROM codigos_recuperacion WHERE correo = $1", [correo]);
    await pool.query("INSERT INTO codigos_recuperacion (correo, codigo, expira_en) VALUES ($1, $2, $3)", [correo, codigo, expiraEn]);
    const opcionesCorreo = {
      from: `"StockVelia" <${process.env.EMAIL_USER}>`,
      to: correo,
      subject: "Código de recuperación de contraseña - StockVelia",
      html: plantillaRecuperacion(codigo),
    };
    await transporter.sendMail(opcionesCorreo);
    res.json({ mensaje: "Código de verificación enviado al correo electrónico." });
  } catch (error) {
    console.error("Error al solicitar recuperación:", error);
    res.status(500).json({ error: "Error al enviar el código de recuperación." });
  }
};

export const restablecerPassword = async (req, res) => {
  const { correo, codigo, nuevaPassword } = req.body;
  try {
    const resultadoCodigo = await pool.query("SELECT * FROM codigos_recuperacion WHERE correo = $1 AND codigo = $2", [correo, codigo]);
    if (resultadoCodigo.rows.length === 0) {
      return res.status(400).json({ error: "El código de verificación es incorrecto." });
    }
    const registroCodigo = resultadoCodigo.rows[0];
    if (new Date(registroCodigo.expira_en) < new Date()) {
      await pool.query("DELETE FROM codigos_recuperacion WHERE correo = $1", [correo]);
      return res.status(400).json({ error: "El código de verificación ha expirado." });
    }
    const salt = await bcrypt.genSalt(10);
    const passwordEncriptada = await bcrypt.hash(nuevaPassword, salt);
    await pool.query("UPDATE usuario SET password = $1, intentos_fallidos = 0, bloqueo_hasta = NULL WHERE correo = $2", [passwordEncriptada, correo]);
    await pool.query("DELETE FROM codigos_recuperacion WHERE correo = $1", [correo]);
    res.json({ mensaje: "Contraseña restablecida con éxito." });
  } catch (error) {
    console.error("Error al restablecer contraseña:", error);
    res.status(500).json({ error: "Error interno del servidor al cambiar la contraseña." });
  }
};