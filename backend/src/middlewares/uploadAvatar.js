import fs from "fs";
import path from "path";
import multer from "multer";

const directorioAvatares = path.resolve("uploads/avatars");
if (!fs.existsSync(directorioAvatares)) {
    fs.mkdirSync(directorioAvatares, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, directorioAvatares);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const idUsuario = req.usuario?.id_usuario || "user";
        cb(null, `avatar_${idUsuario}_${Date.now()}${ext}`);
    },
});

const fileFilter = (_req, file, cb) => {
    const tiposPermitidos = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!tiposPermitidos.includes(file.mimetype)) {
        return cb(
            new Error("Formato no permitido. Solo se aceptan imágenes JPG, PNG o WEBP."),
            false,
        );
    }
    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }, 
});

export const subirAvatarMiddleware = (req, res, next) => {
    upload.single("foto_perfil")(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({
                    error: "La imagen supera el tamaño máximo permitido de 2 MB.",
                });
            }
            return res.status(400).json({ error: `Error al subir archivo: ${err.message}` });
        }
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        next();
    });
};