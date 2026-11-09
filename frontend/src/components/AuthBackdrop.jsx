import React from "react";

/**
 * Fondo animado con iconos de inventario flotando.
 * Guárdalo en: src/components/AuthBackdrop.jsx
 * Uso: <AuthBackdrop /> como primer hijo de <div className="au-page ...">
 */
const ICONS = {
    box: ["M21 8l-9-5-9 5v8l9 5 9-5V8z", "M3.3 7.5l8.7 5 8.7-5", "M12 22V12.5"],
    chart: ["M18 20V10", "M12 20V4", "M6 20v-6"],
    bell: ["M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9", "M13.7 21a2 2 0 0 1-3.4 0"],
    cart: [
        "M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6",
        "M10 21a1 1 0 1 1-2 0 1 1 0 0 1 2 0z",
        "M21 21a1 1 0 1 1-2 0 1 1 0 0 1 2 0z",
    ],
    tag: ["M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z", "M7 7h.01"],
    truck: [
        "M1 3h15v13H1z",
        "M16 8h4l3 3v5h-7V8z",
        "M8 19.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z",
        "M21 19.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z",
    ],
    check: ["M22 11.1V12a10 10 0 1 1-5.9-9.1", "M22 4L12 14l-3-3"],
    clipboard: [
        "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2",
        "M9 3h6v4H9z",
        "M9 12h6",
        "M9 16h6",
    ],
    trend: ["M23 6l-9.5 9.5-5-5L1 18", "M17 6h6v6"],
    barcode: ["M4 5v14", "M8 5v14", "M12 5v14", "M16 5v14", "M20 5v14"],
    shield: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"],
    dollar: ["M12 1v22", "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"],
};

// x / y en %, s = tamaño en px, t = duración, d = retraso, dx = desplazamiento lateral
const ITEMS = [
    { icon: "box", x: "3%", y: "20%", s: 56, t: 13, d: -2, dx: "14px" },
    { icon: "chart", x: "8%", y: "45%", s: 46, t: 16, d: -7, dx: "-12px" },
    { icon: "bell", x: "2%", y: "68%", s: 50, t: 12, d: -4, dx: "10px" },
    { icon: "cart", x: "9%", y: "86%", s: 54, t: 15, d: -9, dx: "-10px" },
    { icon: "tag", x: "30%", y: "2.5%", s: 42, t: 14, d: -5, dx: "12px" },
    { icon: "truck", x: "55%", y: "2%", s: 48, t: 17, d: -11, dx: "-14px" },
    { icon: "shield", x: "74%", y: "3%", s: 44, t: 12, d: -3, dx: "10px" },
    { icon: "trend", x: "94%", y: "12%", s: 52, t: 15, d: -6, dx: "-12px" },
    { icon: "check", x: "90%", y: "35%", s: 46, t: 13, d: -8, dx: "14px" },
    { icon: "clipboard", x: "95%", y: "58%", s: 54, t: 16, d: -1, dx: "-10px" },
    { icon: "barcode", x: "91%", y: "80%", s: 48, t: 14, d: -10, dx: "12px" },
    { icon: "dollar", x: "68%", y: "93%", s: 42, t: 18, d: -12, dx: "-12px" },
];

function AuthBackdrop() {
    return (
        <div className="au-bg" aria-hidden="true">
            {ITEMS.map((it, i) => (
                <span
                    key={i}
                    style={{
                        "--x": it.x,
                        "--y": it.y,
                        "--s": `${it.s}px`,
                        "--t": `${it.t}s`,
                        "--d": `${it.d}s`,
                        "--dx": it.dx,
                    }}
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        {ICONS[it.icon].map((d, k) => (
                            <path key={k} d={d} />
                        ))}
                    </svg>
                </span>
            ))}
        </div>
    );
}

export default AuthBackdrop;