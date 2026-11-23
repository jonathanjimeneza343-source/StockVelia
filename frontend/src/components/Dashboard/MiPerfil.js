import React, { useEffect, useState, useCallback } from "react";
import { IconCamera, IconPalette, IconLock, IconUser } from "@tabler/icons-react";
import Swal from "sweetalert2";
import api from "../../services/api";
import { aplicarColorTemaEmpresa, obtenerUrlAvatar } from "../../utils/temaEmpresa";
import "../../styles/MiPerfil.css";

const PALETA_COLORES = [
    { nombre: "Morado StockVelia", hex: "#5e059e" },
    { nombre: "Ámbar / Dorado", hex: "#d97706" },
    { nombre: "Esmeralda", hex: "#059669" },
    { nombre: "Azul Corporativo", hex: "#2563eb" },
    { nombre: "Carmesí", hex: "#dc2626" },
    { nombre: "Índigo Profundo", hex: "#4338ca" },
];

const FORMATOS_PERMITIDOS = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const TAMANO_MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

function MiPerfil({ onUsuarioActualizado }) {
    const [perfil, setPerfil] = useState(null);
    const [nombre, setNombre] = useState("");
    const [telefono, setTelefono] = useState("");
    const [passwordActual, setPasswordActual] = useState("");
    const [nuevaPassword, setNuevaPassword] = useState("");
    const [confirmarPassword, setConfirmarPassword] = useState("");
    const [archivoFoto, setArchivoFoto] = useState(null);
    const [previewFoto, setPreviewFoto] = useState(null);
    const [colorTema, setColorTema] = useState("#5e059e");
    const [guardandoPerfil, setGuardandoPerfil] = useState(false);
    const [guardandoFoto, setGuardandoFoto] = useState(false);
    const [guardandoColor, setGuardandoColor] = useState(false);

    const cargarPerfil = useCallback(async () => {
        try {
            const { data } = await api.get("/usuarios/perfil");
            const colorActual = data.color_tema || "#5e059e";
            setPerfil(data);
            setNombre(data.nombre || "");
            setTelefono(data.telefono || "");
            setColorTema(colorActual);
            aplicarColorTemaEmpresa(colorActual);
        } catch (error) {
            Swal.fire({
                icon: "error",
                iconColor: "#5e059e",
                title: "Error",
                text: error.response?.data?.error || "No se pudo cargar tu perfil.",
                confirmButtonColor: "#5e059e",
            });
        }
    }, []);

    useEffect(() => {
        cargarPerfil();
    }, [cargarPerfil]);

    useEffect(() => {
        return () => {
            if (previewFoto) {
                URL.revokeObjectURL(previewFoto);
            }
        };
    }, [previewFoto]);

    const manejarErrorPeticion = (error, mensajeDefecto) => {
        const status = error.response?.status;
        const mensaje = error.response?.data?.error || mensajeDefecto;
        Swal.fire({
            icon: "error",
            iconColor: "#5e059e",
            title: status === 403 ? "Acceso restringido" : "Error",
            text: mensaje,
            confirmButtonColor: "#5e059e",
        });
    };

    const limpiarSeleccionFoto = () => {
        if (previewFoto) {
            URL.revokeObjectURL(previewFoto);
        }
        setArchivoFoto(null);
        setPreviewFoto(null);
    };

    const handleSeleccionFoto = (e) => {
        const archivo = e.target.files?.[0];
        if (!archivo) return;

        if (!FORMATOS_PERMITIDOS.includes(archivo.type)) {
            Swal.fire({
                icon: "warning",
                iconColor: "#5e059e",
                title: "Formato no permitido",
                text: "Solo se permiten imágenes JPG, PNG o WEBP.",
                confirmButtonColor: "#5e059e",
            });
            e.target.value = "";
            return;
        }

        if (archivo.size > TAMANO_MAX_BYTES) {
            Swal.fire({
                icon: "warning",
                iconColor: "#5e059e",
                title: "Archivo muy pesado",
                text: "La fotografía de perfil no puede superar los 2 MB.",
                confirmButtonColor: "#5e059e",
            });
            e.target.value = "";
            return;
        }

        if (previewFoto) {
            URL.revokeObjectURL(previewFoto);
        }
        setArchivoFoto(archivo);
        setPreviewFoto(URL.createObjectURL(archivo));
    };

    const handleSubirFoto = async (e) => {
        e.preventDefault();
        if (!archivoFoto) return;

        const formData = new FormData();
        formData.append("foto_perfil", archivoFoto);
        setGuardandoFoto(true);

        try {
            const { data } = await api.post("/usuarios/perfil/foto", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            const usuarioGuardado = JSON.parse(localStorage.getItem("usuario") || "{}");
            const usuarioActualizado = {
                ...usuarioGuardado,
                foto_perfil: data.foto_perfil,
            };
            localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));
            onUsuarioActualizado?.(usuarioActualizado);
            setPerfil((prev) => ({ ...prev, foto_perfil: data.foto_perfil }));
            limpiarSeleccionFoto();

            Swal.fire({
                icon: "success",
                iconColor: colorTema || "#5e059e",
                title: "¡Foto actualizada!",
                text: data.mensaje,
                timer: 1500,
                showConfirmButton: false,
            });
        } catch (error) {
            manejarErrorPeticion(error, "No se pudo subir la foto de perfil.");
        } finally {
            setGuardandoFoto(false);
        }
    };

    const handleGuardarDatos = async (e) => {
        e.preventDefault();

        if (!nombre.trim()) {
            Swal.fire({
                icon: "warning",
                iconColor: "#5e059e",
                title: "Nombre requerido",
                text: "El nombre completo no puede estar vacío.",
                confirmButtonColor: "#5e059e",
            });
            return;
        }

        const intentaCambiarPassword = Boolean(passwordActual || nuevaPassword || confirmarPassword);

        if (intentaCambiarPassword) {
            if (!passwordActual || !nuevaPassword || !confirmarPassword) {
                Swal.fire({
                    icon: "warning",
                    iconColor: "#5e059e",
                    title: "Campos incompletos",
                    text: "Completa tu contraseña actual, la nueva contraseña y su confirmación.",
                    confirmButtonColor: "#5e059e",
                });
                return;
            }

            if (!PASSWORD_REGEX.test(nuevaPassword)) {
                Swal.fire({
                    icon: "warning",
                    iconColor: "#5e059e",
                    title: "Contraseña insegura",
                    text: "La nueva contraseña debe tener al menos 6 caracteres, una mayúscula, una minúscula y un número.",
                    confirmButtonColor: "#5e059e",
                });
                return;
            }

            if (nuevaPassword !== confirmarPassword) {
                Swal.fire({
                    icon: "error",
                    iconColor: "#5e059e",
                    title: "Contraseñas distintas",
                    text: "La nueva contraseña y su confirmación no coinciden.",
                    confirmButtonColor: "#5e059e",
                });
                return;
            }
        }

        setGuardandoPerfil(true);
        try {
            const payload = {
                nombre: nombre.trim(),
                telefono: telefono.trim(),
            };
            if (intentaCambiarPassword) {
                payload.passwordActual = passwordActual;
                payload.nuevaPassword = nuevaPassword;
            }

            const { data } = await api.put("/usuarios/perfil", payload);
            const usuarioGuardado = JSON.parse(localStorage.getItem("usuario") || "{}");
            const usuarioActualizado = {
                ...usuarioGuardado,
                nombre: data.usuario.nombre,
                telefono: data.usuario.telefono,
            };
            localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));
            onUsuarioActualizado?.(usuarioActualizado);

            setPasswordActual("");
            setNuevaPassword("");
            setConfirmarPassword("");
            await cargarPerfil();

            Swal.fire({
                icon: "success",
                iconColor: colorTema || "#5e059e",
                title: "¡Perfil guardado!",
                text: data.mensaje,
                timer: 1500,
                showConfirmButton: false,
            });
        } catch (error) {
            manejarErrorPeticion(error, "No se pudieron guardar los cambios.");
        } finally {
            setGuardandoPerfil(false);
        }
    };

    const handleGuardarColor = async (e) => {
        e.preventDefault();
        setGuardandoColor(true);

        try {
            const { data } = await api.put("/usuarios/empresa/color", {
                color_tema: colorTema,
            });
            const nuevoColor = data.empresa.color_tema;
            const usuarioGuardado = JSON.parse(localStorage.getItem("usuario") || "{}");
            const empresasActualizadas = (usuarioGuardado.empresasDisponibles || []).map((emp) =>
                Number(emp.id_empresa) === Number(data.empresa.id_empresa)
                    ? { ...emp, color_tema: nuevoColor }
                    : emp
            );
            const usuarioActualizado = {
                ...usuarioGuardado,
                color_tema: nuevoColor,
                empresasDisponibles: empresasActualizadas,
            };

            localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));
            setPerfil((prev) => (prev ? { ...prev, color_tema: nuevoColor } : prev));
            aplicarColorTemaEmpresa(nuevoColor);
            onUsuarioActualizado?.(usuarioActualizado);

            Swal.fire({
                icon: "success",
                iconColor: nuevoColor,
                title: "¡Color actualizado!",
                text: data.mensaje,
                timer: 1500,
                showConfirmButton: false,
            });
        } catch (error) {
            manejarErrorPeticion(error, "No se pudo actualizar el color de la empresa.");
        } finally {
            setGuardandoColor(false);
        }
    };

    if (!perfil) {
        return <div className="mi-perfil-container">Cargando perfil...</div>;
    }

    const avatarMostrado = previewFoto || obtenerUrlAvatar(perfil.foto_perfil);

    return (
        <div className="mi-perfil-container">
            <h2>Mi Perfil Personal</h2>

            {/* Foto de perfil + datos de solo lectura */}
            <div className="perfil-card">
                <div className="perfil-avatar-bloque">
                    {avatarMostrado ? (
                        <img src={avatarMostrado} alt="Foto de perfil" className="perfil-foto-img" />
                    ) : (
                        <div className="perfil-foto-placeholder">
                            {perfil.nombre?.charAt(0).toUpperCase() || <IconUser size={36} />}
                        </div>
                    )}

                    <form onSubmit={handleSubirFoto} className="perfil-foto-form">
                        <label className="btn-secundario">
                            <IconCamera size={18} />
                            <span>Elegir foto (JPG, PNG, WEBP · máx. 2 MB)</span>
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleSeleccionFoto}
                                hidden
                            />
                        </label>

                        {archivoFoto && (
                            <>
                                <button type="submit" className="btn-guardar" disabled={guardandoFoto}>
                                    {guardandoFoto ? "Subiendo..." : "Guardar foto"}
                                </button>
                                <button
                                    type="button"
                                    className="btn-cancelar"
                                    onClick={limpiarSeleccionFoto}
                                    disabled={guardandoFoto}
                                >
                                    Cancelar
                                </button>
                            </>
                        )}
                    </form>
                </div>

                <div className="perfil-solo-lectura">
                    <p><strong>Correo electrónico:</strong> {perfil.correo}</p>
                    <p><strong>Rol asignado:</strong> {perfil.nombre_rol} (Solo lectura)</p>
                    <p><strong>Empresa activa:</strong> {perfil.nombre_empresa} (Solo lectura)</p>
                </div>
            </div>

            <form onSubmit={handleGuardarDatos} className="perfil-card">
                <h3><IconUser size={18} /> Datos personales y seguridad</h3>

                <div className="perfil-grid-campos">
                    <div className="form-group">
                        <label>Nombre completo</label>
                        <input
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Teléfono</label>
                        <input
                            type="text"
                            placeholder="Ej: +57 300 123 4567"
                            value={telefono}
                            onChange={(e) => setTelefono(e.target.value)}
                        />
                    </div>
                </div>

                <div className="perfil-grid-campos">
                    <div className="form-group">
                        <label><IconLock size={15} /> Contraseña actual (solo si deseas cambiarla)</label>
                        <input
                            type="password"
                            value={passwordActual}
                            onChange={(e) => setPasswordActual(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Nueva contraseña</label>
                        <input
                            type="password"
                            placeholder="Mín. 6 caracteres, mayúscula, minúscula y número"
                            value={nuevaPassword}
                            onChange={(e) => setNuevaPassword(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Confirmar nueva contraseña</label>
                        <input
                            type="password"
                            value={confirmarPassword}
                            onChange={(e) => setConfirmarPassword(e.target.value)}
                        />
                    </div>
                </div>

                <button type="submit" className="btn-guardar" disabled={guardandoPerfil}>
                    {guardandoPerfil ? "Guardando..." : "Guardar cambios"}
                </button>
            </form>

            {perfil.id_rol === 1 && (
                <form onSubmit={handleGuardarColor} className="perfil-card">
                    <h3><IconPalette size={18} /> Color de tema de {perfil.nombre_empresa}</h3>
                    <div className="paleta-colores">
                        {PALETA_COLORES.map((item) => (
                            <button
                                key={item.hex}
                                type="button"
                                className={`muestra-color ${colorTema.toLowerCase() === item.hex.toLowerCase() ? "activo" : ""}`}
                                style={{ backgroundColor: item.hex }}
                                onClick={() => setColorTema(item.hex)}
                                title={item.nombre}
                            />
                        ))}
                        <input
                            type="color"
                            value={colorTema}
                            onChange={(e) => setColorTema(e.target.value)}
                            aria-label="Color personalizado"
                        />
                        <span className="codigo-color-preview">{colorTema.toUpperCase()}</span>
                    </div>
                    <button type="submit" className="btn-guardar" disabled={guardandoColor}>
                        {guardandoColor ? "Aplicando..." : "Aplicar color de empresa"}
                    </button>
                </form>
            )}
        </div>
    );
}

export default MiPerfil;