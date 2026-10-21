import { test, mock } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import express from 'express';
import bcrypt from 'bcrypt'; 
import pool from '../config/db.js';
import usuarioRoutes from '../routes/usuarioRoutes.js';

// =========================================================================
// CONFIGURACIÓN DE MOCKS INTELIGENTE
// =========================================================================
mock.method(bcrypt, 'genSalt', async () => 'mocked_salt');
mock.method(bcrypt, 'hash', async (password) => `hashed_${password}`);

const mockQuery = mock.method(pool, 'query', async (text, params) => {
  if (text.includes('SELECT')) {
    return { rows: [] }; // Correo libre / sin registros previos
  }
  if (text.includes('INSERT')) {
    return { rows: [{ id_usuario: 1, nombre: params[2], correo: params[3], id_rol: 2 }] };
  }
  if (text.includes('UPDATE')) {
    return { rows: [{ id_usuario: 3, nombre: 'Pedro', correo: 'pedro@example.com', id_rol: 2, estado: true }] };
  }
  return { rows: [] };
});

const app = express();
app.use(express.json());
app.use("/usuarios", usuarioRoutes);

test('GET /usuarios - Debería responder con la lista de usuarios', async () => {
  const mockUsuarios = [{ id_usuario: 1, nombre: 'Carlos', correo: 'carlos@example.com', id_rol: 2, estado: true }];
  
  mockQuery.mock.mockImplementationOnce(async () => {
    return { rows: mockUsuarios };
  });

  const response = await request(app).get("/usuarios?id_empresa=1");

  assert.strictEqual(response.status, 200);
  assert.deepStrictEqual(response.body, mockUsuarios);
});

test('POST /usuarios - Debería crear un usuario a través de la ruta', async () => {
  const response = await request(app)
    .post("/usuarios")
    .set('Content-Type', 'application/json')
    .send({
      nombre: "Carlos",
      correo: "carlos@example.com",
      password: "Password123",
      id_empresa: 1
    });

  assert.strictEqual(response.status, 201);
  assert.deepStrictEqual(response.body, { id_usuario: 1, nombre: 'Carlos', correo: 'carlos@example.com', id_rol: 2 });
});

test('PUT /usuarios/estado/:id - Debería cambiar el estado por ruta', async () => {
  const response = await request(app).put("/usuarios/estado/3");

  assert.strictEqual(response.status, 200);
  assert.strictEqual(response.body.mensaje, "Usuario activado correctamente.");
});