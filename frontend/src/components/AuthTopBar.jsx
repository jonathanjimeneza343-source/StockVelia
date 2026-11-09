import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo_stockvelia.png";

/**
 * Logo + botón "Volver al inicio" en la esquina superior izquierda.
 * Guárdalo en: src/components/AuthTopBar.jsx
 * Uso: <AuthTopBar /> justo después de <AuthBackdrop />
 */
function AuthTopBar() {
    return (
        <header className="au-topbar">
            <Link to="/" className="au-top-brand" aria-label="StockVelia, ir al inicio">
                <span className="au-top-mark">
                    <img src={logo} alt="" />
                </span>
                <span>StockVelia</span>
            </Link>

            <Link to="/" className="au-top-back">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M19 12H5" />
                    <path d="M12 19l-7-7 7-7" />
                </svg>
                Volver al inicio
            </Link>
        </header>
    );
}

export default AuthTopBar;