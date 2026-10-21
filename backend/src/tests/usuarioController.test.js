import { jest, describe, it, expect, beforeEach } from "@jest/globals";

jest.unstable_mockModule("../config/db.js", () => ({
  default: {
    query: jest.fn(),
  },
}));
jest.unstable_mockModule("bcrypt", () => ({
  default: {
    genSalt: jest.fn(),
    hash: jest.fn(),
  },
}));

const { listarUsuarios, crearUsuario, cambiarEstadoUsuario } = await import("../controllers/usuarioController.js");
const pool = (await import("../config/db.js")).default;
const bcrypt = (await import("bcrypt")).default;

describe("Controlador de Usuarios", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { query: {}, body: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe("crearUsuario", () => {
    it("debe retornar error 400 si faltan campos obligatorios", async () => {
      req.body = { nombre: "", correo: "", password: "" };

      await crearUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Todos los campos son obligatorios." });
    });

    it("debe retornar error 400 si la contraseña no cumple con el regex", async () => {
      req.body = { nombre: "Ana", correo: "ana@test.com", password: "123", id_empresa: 1 };

      await crearUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "La contraseña debe tener al menos 6 caracteres, una letra mayúscula, una minúscula y un número.",
      });
    });
  });

  describe("cambiarEstadoUsuario", () => {
    it("debe cambiar el estado del usuario correctamente", async () => {
      req.params.id = "2";
      const usuarioActualizado = { id_usuario: 2, nombre: "Luis", correo: "luis@test.com", id_rol: 2, estado: false };
      
      pool.query.mockResolvedValueOnce({ rows: [usuarioActualizado] });

      await cambiarEstadoUsuario(req, res);

      expect(res.json).toHaveBeenCalledWith({
        mensaje: "Usuario desactivado correctamente.",
        usuario: usuarioActualizado,
      });
    });

    it("debe retornar 404 si el usuario no existe o no se puede modificar", async () => {
      req.params.id = "1";
      pool.query.mockResolvedValueOnce({ rows: [] });

      await cambiarEstadoUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Usuario no encontrado o no se puede modificar." });
    });
  });
});