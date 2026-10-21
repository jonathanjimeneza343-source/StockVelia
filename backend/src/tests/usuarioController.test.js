import { test, mock } from 'node:test';
import assert from 'node:assert';
import bcrypt from 'bcrypt';
import pool from '../config/db.js';
import { listarUsuarios, crearUsuario, cambiarEstadoUsuario } from '../controllers/usuarioController.js';

// =========================================================================
// CONFIGURACIÓN DE MOCKS INTELIGENTE
// =========================================================================

mock.method(bcrypt, 'genSalt', async () => 'mocked_salt');
mock.method(bcrypt, 'hash', async (password) => `hashed_${password}`);

const mockQuery = mock.method(pool, 'query', async (text, params) => {
  if (text.includes('SELECT')) {
    
    if (params && params[0] === 'existente@example.com') {
      return { rows: [{ id_usuario: 1, correo: 'existente@example.com' }] };
    }
    
    return { rows: [] };
  }
  if (text.includes('INSERT')) {
    return { rows: [{ id_usuario: 99, nombre: params[2], correo: params[3], id_rol: 2 }] };
  }
  if (text.includes('UPDATE')) {
    return { rows: [{ id_usuario: Number(params[0]), nombre: 'Luis', correo: 'luis@example.com', id_rol: 2, estado: false }] };
  }
  return { rows: [] };
});

const crearMockReqRes = (query = {}, body = {}, params = {}) => {
  const req = { query, body, params };
  const res = {
    statusCode: 200,
    bodyData: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.bodyData = data;
      return this;
    }
  };
  return { req, res };
};

// =========================================================================
// 1. TESTS PARA listarUsuarios
// =========================================================================

test('listarUsuarios - Debería retornar la lista de usuarios correctamente', async () => {
  const { req, res } = crearMockReqRes({ id_empresa: '1' }, {}, {});
  const usuariosMock = [
    { id_usuario: 1, nombre: 'Ana', correo: 'ana@example.com', id_rol: 2, estado: true }
  ];

  mockQuery.mock.mockImplementationOnce(async () => {
    return { rows: usuariosMock };
  });

  await listarUsuarios(req, res);

  assert.strictEqual(res.statusCode, 200);
  assert.deepStrictEqual(res.bodyData, usuariosMock);
});

test('listarUsuarios - Debería manejar errores del servidor (500)', async () => {
  const { req, res } = crearMockReqRes({ id_empresa: '1' }, {}, {});

  mockQuery.mock.mockImplementationOnce(async () => {
    throw new Error('Error de conexión');
  });

  const spyConsole = mock.method(console, 'error', () => {});

  await listarUsuarios(req, res);

  assert.strictEqual(res.statusCode, 500);
  assert.deepStrictEqual(res.bodyData, { error: "Error al obtener usuarios" });

  spyConsole.mock.restore();
});

// =========================================================================
// 2. TESTS PARA crearUsuario
// =========================================================================

test('crearUsuario - Debería fallar si faltan campos obligatorios', async () => {
  const { req, res } = crearMockReqRes({}, { nombre: 'Juan' }, {});

  await crearUsuario(req, res);

  assert.strictEqual(res.statusCode, 400);
  assert.deepStrictEqual(res.bodyData, { error: "Todos los campos son obligatorios." });
});

test('crearUsuario - Debería fallar si la contraseña es débil', async () => {
  const { req, res } = crearMockReqRes({}, {
    nombre: 'Juan',
    correo: 'juan@example.com',
    password: '123'
  }, {});

  await crearUsuario(req, res);

  assert.strictEqual(res.statusCode, 400);
  assert.match(res.bodyData.error, /La contraseña debe tener al menos 6 caracteres/);
});

test('crearUsuario - Debería fallar si el correo ya está registrado', async () => {
  const { req, res } = crearMockReqRes({}, {
    nombre: 'Juan',
    correo: 'existente@example.com',
    password: 'Password123'
  }, {});

  await crearUsuario(req, res);

  assert.strictEqual(res.statusCode, 400);
  assert.deepStrictEqual(res.bodyData, { error: "El correo ya está registrado" });
});

test('crearUsuario - Debería crear el usuario exitosamente', async () => {
  const datosUsuario = {
    nombre: 'Juan',
    correo: 'nuevo@example.com',
    password: 'Password123',
    id_empresa: 5
  };
  const { req, res } = crearMockReqRes({}, datosUsuario, {});

  await crearUsuario(req, res);

  assert.strictEqual(res.statusCode, 201);
  assert.deepStrictEqual(res.bodyData, { id_usuario: 99, nombre: 'Juan', correo: 'nuevo@example.com', id_rol: 2 });
});

// =========================================================================
// 3. TESTS PARA cambiarEstadoUsuario
// =========================================================================

test('cambiarEstadoUsuario - Debería cambiar el estado correctamente', async () => {
  const { req, res } = crearMockReqRes({}, {}, { id: '2' });
  const usuarioModificado = { id_usuario: 2, nombre: 'Luis', correo: 'luis@example.com', id_rol: 2, estado: false };

  mockQuery.mock.mockImplementationOnce(async () => {
    return { rows: [usuarioModificado] };
  });

  await cambiarEstadoUsuario(req, res);

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.bodyData.mensaje, "Usuario desactivado correctamente.");
  assert.deepStrictEqual(res.bodyData.usuario, usuarioModificado);
});

test('cambiarEstadoUsuario - Debería retornar 404 si el usuario no existe', async () => {
  const { req, res } = crearMockReqRes({}, {}, { id: '999' });

  mockQuery.mock.mockImplementationOnce(async () => {
    return { rows: [] };
  });

  await cambiarEstadoUsuario(req, res);

  assert.strictEqual(res.statusCode, 404);
  assert.deepStrictEqual(res.bodyData, { error: "Usuario no encontrado o no se puede modificar." });
});