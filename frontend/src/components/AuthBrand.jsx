import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo_stockvelia.png";

/**
 * Panel lateral morado compartido por Login y Registro.
 * Guárdalo en: src/components/AuthBrand.jsx
 *
 * Props:
 *  - illustration: ruta del SVG
 *  - title / text: mensaje de marca
 *  - steps (opcional): lista de pasos en píldoras
 *  - chips (opcional): hasta 2 tarjetas flotantes { tone: "warn" | "ok", icon, title, sub }
 */
function AuthBrand({ illustration, title, text, steps, chips = [] }) {
    return (
        <aside className="au-brand">
            <Link to="/" className="au-logo">
                <img src={logo} alt="" />
                <span>StockVelia</span>
            </Link>

            <div className="au-stage" aria-hidden="true">
                <img src={illustration} alt="" />
                {chips.map((c, i) => (
                    <div
                        key={c.title}
                        className={`au-chip au-chip--${i === 0 ? "a" : "b"} au-chip--${c.tone}`}
                    >
                        <i>{c.icon}</i>
                        <div>
                            <b>{c.title}</b>
                            <small>{c.sub}</small>
                        </div>
                    </div>
                ))}
            </div>

            <div className="au-copy">
                <p className="au-copy-title">{title}</p>
                <p className="au-copy-text">{text}</p>
                {steps && (
                    <ol className="au-steps">
                        {steps.map((s) => (
                            <li key={s}>{s}</li>
                        ))}
                    </ol>
                )}
            </div>
        </aside>
    );
}

export default AuthBrand;