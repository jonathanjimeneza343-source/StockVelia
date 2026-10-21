import { jest, describe, it, expect, beforeEach } from "@jest/globals";

jest.unstable_mockModule("../config/db.js", () => ({
  default: {
    query: jest.fn(),
  },
}));

const request = (await import("supertest")).default;
const express = (await import("express")).default;
const usuarioRoutes = (await import("../routes/usuarioRoutes.js")).default;
const pool = (await import("../config/db.js")).default;

const app = express();
app.use(express.json());
app.use("/usuarios", usuarioRoutes);

describe("Rutas de Usuario (/usuarios)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /usuarios", () => {
    it("debe responder con la lista de usuarios", async () => {
      const mockUsuarios = [{ id_usuario: 1, nombre: "Carlos", correo: "carlos@test.com" }];
      pool.query.mockResolvedValueOnce({ rows: mockUsuarios });

      const response = await request(app).get("/usuarios?id_empresa=1");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUsuarios);
    });
  });

  describe("POST /usuarios", () => {
    it("debe crear un usuario correctamente mediante la ruta", async () => {
      pool.query.mockResolvedValueOnce({ rows: [] }); // No existe el correo
      const nuevoUsuario = { id_usuario: 1, nombre: "Carlos", correo: "carlos@test.com" };
      pool.query.mockResolvedValueOnce({ rows: [nuevoUsuario] }); // Inserción

      const response = await request(app)
        .post("/usuarios")
        .send({
          nombre: "Carlos",
          correo: "carlos@test.com",
          password: "Password1",
          id_empresa: 1,
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(nuevoUsuario);
    });
  });
});