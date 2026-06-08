import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import transporter from '../config/mailer.js';
import { registrarAuditoria } from '../config/auditoriaService.js';

export const registrarEmpresaYUsuario = async (req, res) => {
    const { nombreEmpresa, correoEmpresa, nombreUsuario, correoUsuario, password } = req.body;

    try {
        const usuarioExiste = await pool.query('SELECT * FROM usuario WHERE correo = $1', [correoUsuario]);
        if (usuarioExiste.rows.length > 0) {
            return res.status(400).json({ error: 'El correo del usuario ya está registrado.' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordEncriptada = await bcrypt.hash(password, salt);

        const nuevaEmpresa = await pool.query(
            'INSERT INTO empresa (nombre, correo) VALUES ($1, $2) RETURNING id_empresa',
            [nombreEmpresa, correoEmpresa]
        );
        const idEmpresa = nuevaEmpresa.rows[0].id_empresa;

        const nuevoUsuario = await pool.query(
            'INSERT INTO usuario (id_empresa, id_rol, nombre, correo, password) VALUES ($1, $2, $3, $4, $5) RETURNING id_usuario, nombre, correo',
            [idEmpresa, 1, nombreUsuario, correoUsuario, passwordEncriptada]
        );

        await registrarAuditoria(
            nuevoUsuario.rows[0].id_usuario, 
            'empresa/usuario', 
            'REGISTRO', 
            idEmpresa, 
            `Se registró la empresa ${nombreEmpresa} y su administrador.`
        );

        res.status(201).json({
            mensaje: 'Empresa y Usuario Administrador registrados con éxito.',
            usuario: nuevoUsuario.rows[0]
        });

    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ error: 'Error interno del servidor al registrar.' });
    }
};

export const loginUsuario = async (req, res) => {
    const { correo, password } = req.body;

    try {
        const resultado = await pool.query('SELECT * FROM usuario WHERE correo = $1', [correo]);
        
        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: 'El correo electrónico no está registrado.' });
        }

        const usuario = resultado.rows[0];

        if (!usuario.estado) {
            return res.status(403).json({ error: 'Esta cuenta está desactivada. Contacta al administrador.' });
        }

        if (usuario.bloqueo_hasta && new Date(usuario.bloqueo_hasta) > new Date()) {
            return res.status(423).json({ 
                error: `Cuenta bloqueada temporalmente. Intenta de nuevo después de: ${new Date(usuario.bloqueo_hasta).toLocaleTimeString()}` 
            });
        }

        const passwordValida = await bcrypt.compare(password, usuario.password);

        if (!passwordValida) {
            const nuevosIntentos = usuario.intentos_fallidos + 1;
            
            if (nuevosIntentos >= 5) {
                const tiempoBloqueo = new Date(Date.now() + 15 * 60 * 1000); 
                await pool.query(
                    'UPDATE usuario SET intentos_fallidos = $1, bloqueo_hasta = $2 WHERE id_usuario = $3',
                    [nuevosIntentos, tiempoBloqueo, usuario.id_usuario]
                );
                return res.status(423).json({ error: 'Demasiados intentos fallidos. Cuenta bloqueada por 15 minutos.' });
            } else {
                await pool.query('UPDATE usuario SET intentos_fallidos = $1 WHERE id_usuario = $2', [nuevosIntentos, usuario.id_usuario]);
                return res.status(401).json({ error: 'Contraseña incorrecta.', intentosRestantes: 5 - nuevosIntentos });
            }
        }

        await pool.query('UPDATE usuario SET intentos_fallidos = 0, bloqueo_hasta = NULL WHERE id_usuario = $1', [usuario.id_usuario]);

        const token = jwt.sign(
            { id_usuario: usuario.id_usuario, id_empresa: usuario.id_empresa, id_rol: usuario.id_rol },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        await registrarAuditoria(
            usuario.id_usuario, 
            'usuario', 
            'LOGIN', 
            usuario.id_usuario, 
            'Inicio de sesión exitoso en el sistema.'
        );

        res.json({
            mensaje: 'Inicio de sesión exitoso.',
            token,
            usuario: {
                id_usuario: usuario.id_usuario,
                id_empresa: usuario.id_empresa,
                nombre: usuario.nombre,
                correo: usuario.correo,
                id_rol: usuario.id_rol
            }
        });

    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ error: 'Error interno del servidor al iniciar sesión.' });
    }
};

export const solicitarRecuperacion = async (req, res) => {
    const { correo } = req.body;

    try {
        const usuarioExiste = await pool.query('SELECT * FROM usuario WHERE correo = $1', [correo]);
        if (usuarioExiste.rows.length === 0) {
            return res.status(404).json({ error: 'El correo electrónico no está registrado.' });
        }

        const codigo = Math.floor(100000 + Math.random() * 900000).toString();
        const expiraEn = new Date(Date.now() + 15 * 60 * 1000);

        await pool.query('DELETE FROM codigos_recuperacion WHERE correo = $1', [correo]);

        await pool.query(
            'INSERT INTO codigos_recuperacion (correo, codigo, expira_en) VALUES ($1, $2, $3)',
            [correo, codigo, expiraEn]
        );

        const opcionesCorreo = {
            from: `"StockVelia" <${process.env.EMAIL_USER}>`,
            to: correo,
            subject: 'Código de recuperación de contraseña - StockVelia',
            html: `<p>Has solicitado restablecer tu contraseña en StockVelia.</p>
                    <p>Tu código de verificación es: <b>${codigo}</b></p>
                    <p>Este código vencerá en 15 minutos.</p>`
        };

        await transporter.sendMail(opcionesCorreo);
        res.json({ mensaje: 'Código de verificación enviado al correo electrónico.' });

    } catch (error) {
        console.error('Error al solicitar recuperación:', error);
        res.status(500).json({ error: 'Error al enviar el código de recuperación.' });
    }
};

export const restablecerPassword = async (req, res) => {
    const { correo, codigo, nuevaPassword } = req.body;

    try {
        const resultadoCodigo = await pool.query(
            'SELECT * FROM codigos_recuperacion WHERE correo = $1 AND codigo = $2',
            [correo, codigo]
        );

        if (resultadoCodigo.rows.length === 0) {
            return res.status(400).json({ error: 'El código de verificación es incorrecto.' });
        }

        const registroCodigo = resultadoCodigo.rows[0];

        if (new Date(registroCodigo.expira_en) < new Date()) {
            await pool.query('DELETE FROM codigos_recuperacion WHERE correo = $1', [correo]);
            return res.status(400).json({ error: 'El código de verificación ha expirado.' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordEncriptada = await bcrypt.hash(nuevaPassword, salt);

        await pool.query('UPDATE usuario SET password = $1, intentos_fallidos = 0, bloqueo_hasta = NULL WHERE correo = $2', [passwordEncriptada, correo]);
        await pool.query('DELETE FROM codigos_recuperacion WHERE correo = $1', [correo]);

        res.json({ mensaje: 'Contraseña restablecida con éxito.' });

    } catch (error) {
        console.error('Error al restablecer contraseña:', error);
        res.status(500).json({ error: 'Error interno del servidor al cambiar la contraseña.' });
    }
};
