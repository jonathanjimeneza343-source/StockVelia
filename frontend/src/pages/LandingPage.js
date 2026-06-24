import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/LandingPage.css';

import logoStockvelia from '../assets/logo_stockvelia.png';

function LandingPage() {
    const [activeTab, setActiveTab] = useState('productos');

    const features = {
        productos: {
            title: "Control de Productos y Stock Minuto a Minuto",
            description: "Gestiona códigos de barras, precios de compra/venta, categorías avanzadas y estados activos/inactivos. Olvídate de los descuadres físicos.",
            badge: "Inventario Base"
        },
        almacenes: {
            title: "Múltiples Almacenes y Bodegas",
            description: "Monitorea la capacidad de ocupación física (desde niveles óptimos del 30% hasta alertas críticas del 100%). Asigna encargados específicos por sucursal.",
            badge: "Logística"
        },
        abc: {
            title: "Clasificación ABC (Análisis de Pareto)",
            description: "El sistema organiza automáticamente tus artículos: Clase A (80% de tus ingresos, alta rotación), Clase B (rotación media) y Clase C (baja rotación). Evita capital estancado.",
            badge: "Inteligencia Comercial"
        },
        clientes: {
            title: "Terceros: Clientes y Proveedores",
            description: "Centraliza directorios comerciales con prefijos internacionales (+57), historiales de compras, facturas asociadas y cuentas por pagar desde un único perfil.",
            badge: "CRM"
        },
        seguridad: {
            title: "Roles, Permisos y Logs de Auditoría",
            description: "Garantiza la integridad del sistema. Registra con fecha y hora cada acción (creación, edición o eliminación) asociada al usuario que la ejecutó.",
            badge: "Seguridad Operativa"
        }
    };

    return (
        <div className="landing-scope">
            {/* --- NAVBAR --- */}
            <header className="landing-navbar">
                <div className="navbar-brand">
                    <img
                        src={logoStockvelia}
                        alt="Logo StockVelia"
                        className="navbar-logo"
                    />

                    <span className="brand-name">
                        StockVelia
                    </span>
                </div>
                <nav className="navbar-links">
                    <a href="#caracteristicas">Módulos</a>
                    <a href="#bento-beneficios">Beneficios</a>
                    <a href="#arquitectura">Arquitectura</a>
                    <a href="#reportes">Reportes</a>
                    <Link to="/login" className="btn-secondary-lng">Iniciar Sesión</Link>
                    <Link to="/registro" className="btn-primary-lng">Registrarse</Link>
                </nav>
            </header>

            {/* --- HERO SECTION --- */}
            <section className="landing-hero-section">
                <div className="hero-content">
                    <span className="hero-badge">🔮 Sistema de Gestión para Microempresas</span>
                    <h1>Optimiza tu inventario con <br /><span className="highlight-text">precisión absoluta</span></h1>
                    <p>
                        Controla stock en múltiples bodegas, automatiza la clasificación de tus productos más vendidos y asegura la trazabilidad de tu operación con un sistema robusto y ágil.
                    </p>
                    <div className="hero-actions">
                        <Link to="/registro" className="btn-primary-lng large">Comenzar Ahora Gratis</Link>
                        <a href="#demo" className="btn-video-lng">
                            <span className="play-icon">▶</span> Explorar Módulos
                        </a>
                    </div>
                </div>

                {/* Mockup del Dashboard con la paleta de color original */}
                <div className="hero-mockup-container" id="demo">
                    <div className="mockup-window">
                        <div className="mockup-header">
                            <span className="dot red"></span>
                            <span className="dot yellow"></span>
                            <span className="dot green"></span>
                            <span className="mockup-title">app.stockvelia.com/dashboard</span>
                        </div>
                        <div className="mockup-body-simulation">
                            <div className="mockup-sidebar">
                                <div className="side-item active">📊 Dashboard</div>
                                <div className="side-item">📦 Productos</div>
                                <div className="side-item">🏢 Almacenes</div>
                                <div className="side-item">👥 Terceros</div>
                                <div className="side-item">📜 Logs de Sistema</div>
                            </div>
                            <div className="mockup-main">
                                <div className="mockup-widgets">
                                    <div className="m-card"><h5>Items Registrados</h5><p>124 Items</p></div>
                                    <div className="m-card"><h5>Capacidad Ocupada</h5><p>64%</p></div>
                                    <div className="m-card alert"><h5>Alertas Stock Mínimo</h5><p className="danger-text">4 Alert</p></div>
                                </div>
                                <div className="mockup-chart-sim">
                                    <div className="chart-bar style-a" style={{ height: '85%' }}><span>Zona A</span></div>
                                    <div className="chart-bar style-b" style={{ height: '45%' }}><span>Zona B</span></div>
                                    <div className="chart-bar style-c" style={{ height: '15%' }}><span>Zona C</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- MÉTRICAS --- */}
            <section className="landing-stats-section">
                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>99.4%</h3>
                        <p>De efectividad en el control de mermas y pérdidas de stock.</p>
                    </div>
                    <div className="stat-card">
                        <h3>Pareto 80/20</h3>
                        <p>Algoritmo automatizado para identificar los productos que generan tus ingresos.</p>
                    </div>
                    <div className="stat-card">
                        <h3>&lt; 2 Segundos</h3>
                        <p>En procesamiento de transacciones, traslados de inventario y actualizaciones.</p>
                    </div>
                </div>
            </section>

            {/* --- MÓDULOS INTERACTIVOS (TABS) --- */}
            <section id="caracteristicas" className="landing-features-section">
                <div className="section-header">
                    <h2>Ecosistema completo para el control de tu empresa</h2>
                    <p>Módulos integrados de extremo a extremo que eliminan los procesos manuales e ineficientes.</p>
                </div>

                <div className="features-interactive-container">
                    <div className="features-tabs-menu">
                        {Object.keys(features).map((key) => (
                            <button
                                key={key}
                                className={`tab-btn ${activeTab === key ? 'active' : ''}`}
                                onClick={() => setActiveTab(key)}
                            >
                                {features[key].title.split(" y ")[0]}
                            </button>
                        ))}
                    </div>

                    <div className="features-tab-content">
                        <span className="content-badge">{features[activeTab].badge}</span>
                        <h3>{features[activeTab].title}</h3>
                        <p>{features[activeTab].description}</p>
                        <Link to="/registro" className="tab-cta-link">Inicializar este módulo en mi cuenta →</Link>
                    </div>
                </div>
            </section>

            {/* --- BENTO GRID BENEFICIOS --- */}
            <section id="bento-beneficios" className="landing-bento-section">
                <h2>Diseñado para el ritmo de la microempresa actual</h2>
                <div className="bento-grid">
                    <div className="bento-item grid-wide">
                        <h3>Temas Adaptativos de Alta Visibilidad</h3>
                        <p>Optimizado para largas jornadas de trabajo. Cambia entre interfaces claras para administración de oficina o interfaces de contraste profundo nocturno para evitar la fatiga visual.</p>
                        <div className="bento-split-view">
                            <div className="split-light">Interfaz Claridad ☀️</div>
                            <div className="split-dark">Contraste Absoluto 🌙</div>
                        </div>
                    </div>
                    <div className="bento-item">
                        <h3>Lector de Barras Integrado</h3>
                        <p>Acelera el ingreso y salida de productos. Compatible de forma nativa con lectores hardware USB/Bluetooth y cámaras de dispositivos móviles.</p>
                    </div>
                    <div className="bento-item">
                        <h3>Notificaciones en Tiempo Real</h3>
                        <p>Recibe alertas visuales críticas de manera inmediata cuando un producto se encuentre por debajo del stock mínimo configurado.</p>
                    </div>
                </div>
            </section>

            {/* --- SECCIÓN NUEVA: EXPORTACIÓN Y REPORTES --- */}
            <section id="reportes" className="landing-reports-section">
                <div className="reports-container">
                    <div className="reports-text">
                        <span className="reports-badge">Hojas de datos e informes</span>
                        <h2>Exporta tu información con un solo clic</h2>
                        <p>
                            Genera reportes instantáneos del estado actual de tus almacenes, listas de precios para proveedores, historiales de auditoría completos y la sábana de movimientos de inventario en formatos estándar **PDF** y **Excel (XLSX)**. Ideal para revisiones contables y auditorías imprevistas.
                        </p>
                        <ul className="reports-list">
                            <li>✓ Reportes de valoración de inventario (Costo total).</li>
                            <li>✓ Descarga de logs de acciones de usuarios para auditorías.</li>
                            <li>✓ Listados filtrados por clasificación ABC de Pareto.</li>
                        </ul>
                    </div>
                    <div className="reports-visual">
                        <div className="file-preview-box">
                            <div className="file-icon pdf">PDF</div>
                            <div className="file-icon excel">XLSX</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- ARQUITECTURA TÉCNICA (NEÓN Y CONSTRASTE) --- */}
            <section id="arquitectura" className="landing-tech-section">
                <div className="section-header-tech">
                    <h2>Infraestructura y Seguridad de Nivel Empresarial</h2>
                    <p>Sólida ingeniería de software enfocada en resguardar la disponibilidad y privacidad de tus datos comerciales.</p>
                </div>
                <div className="tech-grid">
                    <div className="tech-card">
                        <div className="tech-icon">⚡</div>
                        <h4>Backend Asíncrono en Node.js</h4>
                        <p>Construido sobre una arquitectura de JavaScript del lado del servidor que procesa múltiples flujos de inventario sin bloqueos.</p>
                    </div>
                    <div className="tech-card">
                        <div className="tech-icon">🗄️</div>
                        <h4>Persistencia en PostgreSQL</h4>
                        <p>Base de datos relacional potente que asegura la atomicidad y consistencia estricta en cada entrada, salida y traslado de stock.</p>
                    </div>
                    <div className="tech-card">
                        <div className="tech-icon">🛡️</div>
                        <h4>Aislamiento del Entorno e HTTPS</h4>
                        <p>Protección total de variables sensibles mediante entornos cifrados y tráfico protegido de extremo a extremo con SSL/TLS.</p>
                    </div>
                </div>
            </section>

            {/* --- TESTIMONIOS --- */}
            <section className="landing-testimonials-section">
                <h2>Confiado por administradores y desarrolladores</h2>
                <div className="testimonials-container">
                    <div className="testimonial-card">
                        <p>"El módulo de clasificación ABC nos transformó el negocio. Identificamos qué artículos representaban el 80% del flujo de caja de la bodega central en Bogotá y optimizamos las compras."</p>
                        <h5>– Distribuidora J.A., Colombia</h5>
                    </div>
                    <div className="testimonial-card">
                        <p>"Como encargado de sistemas, la trazabilidad por logs de auditoría me da la tranquilidad de saber exactamente qué usuario modificó el stock de un almacén y cuándo."</p>
                        <h5>– Soporte Tecnológico Gabartino</h5>
                    </div>
                </div>
            </section>

            {/* --- CTA FINAL --- */}
            <section className="landing-cta-final">
                <div className="cta-wrapper">
                    <h2>Toma el control definitivo de tus existencias</h2>
                    <p>Regístrate en Stockvelia hoy mismo de manera gratuita y automatiza los flujos operativos de tus almacenes.</p>
                    <Link to="/registro" className="btn-primary-lng large light">Registrar Mi Cuenta Gratis</Link>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="landing-footer">
                <p>&copy; {new Date().getFullYear()} Stockvelia. Todos los derechos reservados.</p>
                <div className="footer-links">
                    <Link to="/login">Ingresar</Link>
                    <Link to="/registro">Crear Cuenta</Link>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;