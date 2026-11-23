import { SERVER_BASE_URL } from "../services/api";

const COLOR_DEFECTO = "#5e059e";

function oscurecerHex(hex, porcentaje = 15) {
    const limpio = (hex || COLOR_DEFECTO).replace("#", "");
    if (!/^[0-9A-Fa-f]{6}$/.test(limpio)) return "#470378";
    const num = parseInt(limpio, 16);
    const factor = 1 - porcentaje / 100;
    const r = Math.max(0, Math.min(255, Math.floor(((num >> 16) & 255) * factor)));
    const g = Math.max(0, Math.min(255, Math.floor(((num >> 8) & 255) * factor)));
    const b = Math.max(0, Math.min(255, Math.floor((num & 255) * factor)));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function aplicarColorTemaEmpresa(colorTema) {
    const color =
        colorTema && /^#[0-9A-Fa-f]{6}$/.test(colorTema.trim())
            ? colorTema.trim()
            : COLOR_DEFECTO;

    document.documentElement.style.setProperty("--color-primario", color);
    document.documentElement.style.setProperty(
        "--color-primario-hover",
        oscurecerHex(color, 15)
    );
}

export function obtenerUrlAvatar(fotoPerfil, baseUrl = SERVER_BASE_URL) {
    if (!fotoPerfil) return null;
    if (fotoPerfil.startsWith("http://") || fotoPerfil.startsWith("https://")) {
        return fotoPerfil;
    }
    return `${baseUrl.replace(/\/$/, "")}/${fotoPerfil.replace(/^\//, "")}`;
}

export function obtenerNombreRol(idRol) {
    switch (Number(idRol)) {
        case 1:
            return "Propietario";
        case 2:
            return "Administrador Operativo";
        case 3:
            return "Empleado";
        default:
            return "Usuario";
    }
}