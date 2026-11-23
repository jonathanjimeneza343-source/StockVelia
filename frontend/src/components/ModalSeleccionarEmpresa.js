import React, { useState } from "react";
import { IconBuildingStore, IconCheck } from "@tabler/icons-react";
import Swal from "sweetalert2";
import api from "../services/api";
import { aplicarColorTemaEmpresa } from "../utils/temaEmpresa";

function ModalSeleccionarEmpresa({ usuario, onSeleccionCompleta }) {
    const empresas = usuario?.empresasDisponibles || [];
    const [seleccionada, setSeleccionada] = useState(
        usuario?.id_empresa || empresas[0]?.id_empresa
    );
    const [cargando, setCargando] = useState(false);

    if (!usuario || usuario.id_rol !== 1 || empresas.length <= 1) {
        return null;
    }

    const confirmarEmpresa = async () => {
        if (!seleccionada) return;
        setCargando(true);
        try {
            const response = await api.post("/auth/change-company", {
                id_empresa: Number(seleccionada),
            });

            const colorTema =
                response.data.color_tema ||
                empresas.find((e) => Number(e.id_empresa) === Number(seleccionada))
                    ?.color_tema ||
                "#5e059e";

            const usuarioActualizado = {
                ...usuario,
                id_empresa: response.data.id_empresa,
                nombre_empresa: response.data.nombre_empresa,
                color_tema: colorTema,
            };

            if (response.data.token) {
                localStorage.setItem("token", response.data.token);
            }
            localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));
            aplicarColorTemaEmpresa(colorTema);
            onSeleccionCompleta(usuarioActualizado);
        } catch (error) {
            Swal.fire({
                icon: "error",
                iconColor: "#5e059e",
                title: "Error al seleccionar empresa",
                text: error.response?.data?.error || "No se pudo establecer la empresa.",
                confirmButtonColor: "#5e059e",
            });
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-contenido">
                <div className="modal-header">
                    <h3>Selecciona una empresa</h3>
                </div>
                <p className="modal-info">
                    Tienes {empresas.length} empresas asociadas a tu cuenta. Elige con cuál deseas operar:
                </p>

                <div className="lista-empresas-selector" style={{ display: "flex", flexDirection: "column", gap: "10px", margin: "16px 0" }}>
                    {empresas.map((emp) => {
                        const activa = Number(seleccionada) === Number(emp.id_empresa);
                        const colorEmpresa = emp.color_tema || "#5e059e";
                        return (
                            <button
                                key={emp.id_empresa}
                                type="button"
                                className={`item-empresa-selector ${activa ? "activo" : ""}`}
                                onClick={() => setSeleccionada(emp.id_empresa)}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "12px 14px",
                                    borderRadius: "8px",
                                    border: `2px solid ${activa ? colorEmpresa : "#e2e8f0"}`,
                                    backgroundColor: activa ? "#f8fafc" : "#ffffff",
                                    cursor: "pointer",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <span
                                        style={{
                                            width: 14,
                                            height: 14,
                                            borderRadius: "50%",
                                            backgroundColor: colorEmpresa,
                                            display: "inline-block",
                                        }}
                                    />
                                    <IconBuildingStore size={18} />
                                    <strong>{emp.nombre_empresa}</strong>
                                </div>
                                {activa && <IconCheck size={18} color={colorEmpresa} />}
                            </button>
                        );
                    })}
                </div>

                <div className="modal-acciones">
                    <button
                        type="button"
                        className="btn-guardar"
                        onClick={confirmarEmpresa}
                        disabled={cargando}
                    >
                        {cargando ? "Ingresando..." : "Continuar al Dashboard"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ModalSeleccionarEmpresa;