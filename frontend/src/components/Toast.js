import React, { useEffect } from "react";
import {
    IconCheck,
    IconAlertTriangle,
    IconXCircle,
    IconInfoCircle,
    IconX,
} from "@tabler/icons-react";

const ESTILOS_TIPO = {
    success: {
        border: "#059669",
        bg: "#ecfdf5",
        color: "#065f46",
        Icon: IconCheck,
    },
    warning: {
        border: "#d97706",
        bg: "#fffbeb",
        color: "#92400e",
        Icon: IconAlertTriangle,
    },
    error: {
        border: "#dc2626",
        bg: "#fef2f2",
        color: "#991b1b",
        Icon: IconXCircle,
    },
    info: {
        border: "#5e059e",
        bg: "#f5f3ff",
        color: "#4c1d95",
        Icon: IconInfoCircle,
    },
};

function Toast({
    open = false,
    type = "info",
    title = "",
    message = "",
    duration = 3500,
    onClose,
}) {
    useEffect(() => {
        if (!open || !duration || typeof onClose !== "function") return;
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [open, duration, onClose]);

    if (!open || (!title && !message)) return null;

    const config = ESTILOS_TIPO[type] || ESTILOS_TIPO.info;
    const Icono = config.Icon;

    return (
        <div
            role="status"
            aria-live="polite"
            style={{
                position: "fixed",
                bottom: "20px",
                right: "20px",
                zIndex: 9999,
                maxWidth: "360px",
                width: "calc(100% - 32px)",
                backgroundColor: config.bg,
                color: config.color,
                borderLeft: `4px solid ${config.border}`,
                borderRadius: "10px",
                padding: "12px 14px",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.12)",
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
            }}
        >
            <Icono size={20} style={{ flexShrink: 0, marginTop: "2px" }} />
            <div style={{ flex: 1, fontSize: "0.9rem", lineHeight: 1.35 }}>
                {title && <div style={{ fontWeight: 700, marginBottom: message ? "2px" : 0 }}>{title}</div>}
                {message && <div>{message}</div>}
            </div>
            {typeof onClose === "function" && (
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Cerrar notificación"
                    style={{
                        background: "transparent",
                        border: "none",
                        color: config.color,
                        cursor: "pointer",
                        padding: "2px",
                        display: "inline-flex",
                        alignItems: "center",
                    }}
                >
                    <IconX size={16} />
                </button>
            )}
        </div>
    );
}

export default Toast;