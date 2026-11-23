import { Router } from "express";
import {
  obtenerMiPerfil,
  actualizarMiPerfil,
  actualizarFotoPerfil,
  crearEmpresa,
  actualizarColorEmpresa,
  listarUsuariosEmpresa,
  crearUsuarioPorAdmin,
  actualizarUsuarioPorAdmin,
  cambiarEstadoUsuario,
  eliminarUsuarioLogico,
} from "../controllers/usuarioController.js";
import { verificarToken, verificarRol } from "../middlewares/authMiddleware.js";
import { subirAvatarMiddleware } from "../middlewares/uploadAvatar.js";

const router = Router();

router.get("/perfil", verificarToken, obtenerMiPerfil);
router.put("/perfil", verificarToken, actualizarMiPerfil);
router.post(
  "/perfil/foto",
  verificarToken,
  subirAvatarMiddleware,
  actualizarFotoPerfil
);

router.post("/empresa", verificarToken, verificarRol(1), crearEmpresa);
router.put(
  "/empresa/color",
  verificarToken,
  verificarRol(1),
  actualizarColorEmpresa
);

router.get("/", verificarToken, verificarRol(1, 2), listarUsuariosEmpresa);
router.post("/", verificarToken, verificarRol(1, 2), crearUsuarioPorAdmin);
router.put("/:id", verificarToken, verificarRol(1, 2), actualizarUsuarioPorAdmin);
router.patch(
  "/:id/estado",
  verificarToken,
  verificarRol(1, 2),
  cambiarEstadoUsuario
);
router.delete(
  "/:id",
  verificarToken,
  verificarRol(1, 2),
  eliminarUsuarioLogico
);

export default router;