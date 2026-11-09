import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import '../styles/LandingPage.css';
import logoStockvelia from '../assets/logo_stockvelia.png';

/* ---------- Hooks y utilidades ---------- */
function useInView(threshold = 0.2) {
    const ref = useRef(null);
    const [seen, setSeen] = useState(false);
    useEffect(() => {
        const el = ref.current; if (!el) return;
        const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold });
        io.observe(el); return () => io.disconnect();
    }, [threshold]);
    return [ref, seen];
}
function Reveal({ children, delay = 0, as: Tag = 'div', className = '', ...rest }) {
    const [ref, seen] = useInView(0.15);
    return <Tag ref={ref} className={`reveal ${seen ? 'in' : ''} ${className}`} style={{ '--d': `${delay}ms` }} {...rest}>{children}</Tag>;
}
function CountUp({ to, suffix = '' }) {
    const [ref, seen] = useInView(0.5);
    const [v, setV] = useState(0);
    useEffect(() => {
        if (!seen) return;
        let raf; const t0 = performance.now();
        const tick = (t) => { const p = Math.min((t - t0) / 1600, 1); setV(Math.round(to * (1 - Math.pow(1 - p, 4)))); if (p < 1) raf = requestAnimationFrame(tick); };
        raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
    }, [seen, to]);
    return <span ref={ref}>{v}{suffix}</span>;
}

/* ---------- Datos ---------- */
const INITIAL = [
    { id: 1, name: 'Arroz 500 g', code: '7701001', cat: 'Granos', cost: 2800, price: 3500, stock: 18, min: 10, on: true },
    { id: 2, name: 'Aceite 1 L', code: '7701002', cat: 'Aceites', cost: 9100, price: 11900, stock: 12, min: 8, on: true },
    { id: 3, name: 'Panela', code: '7701003', cat: 'Granos', cost: 3200, price: 4200, stock: 9, min: 6, on: true },
    { id: 4, name: 'Detergente 1 kg', code: '7701004', cat: 'Aseo', cost: 6400, price: 8500, stock: 7, min: 5, on: true },
];
const VIEWS = [['panel', 'Panel'], ['productos', 'Productos'], ['almacenes', 'Almacenes'], ['terceros', 'Terceros'], ['reportes', 'Reportes']];
const WAREHOUSES = [
    { name: 'Bodega Central', zone: 'Bogotá', boss: 'Laura M.', occ: 64 },
    { name: 'Sucursal Norte', zone: 'Usaquén', boss: 'Carlos R.', occ: 32 },
    { name: 'Sucursal Sur', zone: 'Kennedy', boss: 'Andrea P.', occ: 91 },
];
const PARTIES = {
    clientes: [['Tienda La Esquina', '+57 310 000 0001', '$1.240.000', 'Compras'], ['Minimercado Central', '+57 311 000 0002', '$860.000', 'Compras'], ['Ferretería El Tornillo', '+57 312 000 0003', '$2.150.000', 'Compras']],
    proveedores: [['Distribuidora Andina', '+57 320 000 0004', '$3.400.000', 'Por pagar'], ['Alimentos del Valle', '+57 321 000 0005', '$1.120.000', 'Por pagar'], ['Aseo y Hogar S.A.S.', '+57 322 000 0006', '$0', 'Por pagar']],
};
const REPORTS = [['Inventario valorizado', 'Costo total por almacén'], ['Movimientos', 'Entradas y salidas por fechas'], ['Clasificación ABC', 'Productos por rotación'], ['Auditoría', 'Acciones por usuario']];
const DAY = [
    { t: '08:00', title: 'Llega la mercancía', tag: 'Entrada', kind: 'in', desc: 'Registras la compra al proveedor y las existencias suben al instante.', lvl: 85 },
    { t: '11:30', title: 'Hora pico de ventas', tag: 'Salida', kind: 'out', desc: 'Cada venta descuenta el stock en tiempo real. Sin descuadres, sin vender lo que no hay.', lvl: 55 },
    { t: '14:00', title: 'Salta la alerta', tag: 'Alerta', kind: 'warn', desc: 'Aceite 1 L toca su umbral mínimo y el panel te avisa en pantalla de inmediato.', lvl: 28 },
    { t: '16:30', title: 'Reabasteces a tiempo', tag: 'Entrada', kind: 'in', desc: 'Pides al proveedor antes de quedarte sin stock. Cero ventas perdidas.', lvl: 90 },
    { t: '18:00', title: 'Cierras con un reporte', tag: 'Reporte', kind: 'rep', desc: 'Exportas el historial del día en PDF o Excel para tu contabilidad.', lvl: 90 },
];
const OBJS = [
    ['Automatizar el flujo', 'Registro concurrente de entradas y salidas de productos.'],
    ['Prevenir quiebres', 'Un motor de alertas visuales ante umbrales mínimos de inventario.'],
    ['Decidir con datos', 'Reportes y exportación para la toma de decisiones gerenciales.'],
    ['Aprender en minutos', 'Una experiencia intuitiva que reduce la curva de aprendizaje.'],
];
const FAQ = [
    ['¿Qué es StockVelia?', 'Es una plataforma web integral e inteligente para microempresas y PYMES comerciales. Funciona como un asistente financiero automatizado que centraliza y protege tu inventario en tiempo real.'],
    ['¿Necesito conocimientos técnicos?', 'No. La interfaz es moderna e intuitiva: cualquier persona puede dominarla en pocos minutos y tomar el control de sus activos.'],
    ['¿Cómo sé cuándo debo reabastecer?', 'El sistema monitorea tus productos y dispara alertas visuales en pantalla cuando un artículo cruza su umbral mínimo.'],
    ['¿Qué puede hacer cada persona de mi equipo?', 'Hay dos perfiles. El Administrador tiene visión gerencial, auditorías y gestión de cuentas; el Operador se enfoca en el registro diario.'],
    ['¿Puedo sacar reportes para mi contabilidad?', 'Sí. Genera historiales detallados por rango de fechas y descárgalos en PDF o Excel para respaldar tu contabilidad y análisis fuera de línea.'],
    ['¿En qué se diferencia de Excel o de un ERP?', 'Es más ligero que un ERP gigante y más seguro que un Excel: sin fórmulas rotas ni datos perdidos, todo se sincroniza de forma automática y centralizada.'],
];
const MARQUEE = ['Minimercados', 'Boutiques', 'Ferreterías', 'Papelerías', 'Droguerías', 'Emprendimientos en expansión', 'Distribuidoras', 'Tiendas de barrio'];
const STORY = [
    { k: 'catalogo', n: 'Catálogo maestro', t: 'Todo tu inventario, en un solo lugar.', d: 'Registra productos por categoría con código, costo, precio de venta y umbral mínimo. Ordenado desde el primer día.' },
    { k: 'mov', n: 'Control transaccional', t: 'Cada entrada y salida, al instante.', d: 'Compras, devoluciones, ventas y bajas actualizan tus existencias en el mismo momento. Sin descuadres.' },
    { k: 'alert', n: 'Alertas tempranas', t: 'Te avisa antes de que se agote.', d: 'Cuando un producto baja de su mínimo, lo ves en tiempo real y reabasteces a tiempo.' },
    { k: 'rep', n: 'Reportes gerenciales', t: 'Decide con datos, no con intuición.', d: 'Historiales detallados y reportes consolidados que exportas a PDF o Excel con un clic.' },
];
const BENEFITS = [
    ['Elimina las fugas hormiga', 'Detecta mermas y diferencias antes de que golpeen tus finanzas.'],
    ['Evita perder ventas', 'Reabastece a tiempo tus productos más vendidos.'],
    ['Libera capital atrapado', 'Convierte el stock estancado en liquidez.'],
    ['Disponible y protegido', 'Tiempo real y protección estricta de tu información.'],
];
const ROLES = {
    admin: ['Crear y editar productos', 'Registrar entradas y salidas', 'Exportar reportes', 'Gestionar usuarios'],
    operador: ['Registrar entradas y salidas'],
};
const ALL_PERMS = ROLES.admin;

const PROBLEMS = [
    ['leak', 'Fugas de capital hormiga', 'Productos vencidos, deterioros y diferencias de inventario que nunca se detectan a tiempo.', 'Tu capital, mes a mes', 'Detecta mermas y diferencias con cada movimiento que registras.'],
    ['gap', 'Quiebres de stock', 'No anticipar la falta de mercancía de alta rotación: el cliente termina comprando en la competencia.', 'Tus productos estrella en el estante', 'Alertas visuales cuando un producto cruza su mínimo, para reabastecer a tiempo.'],
    ['lock', 'Dinero atrapado', 'Mercancía que no rota y bloquea el flujo de caja que tu negocio necesita para crecer.', 'Mercancía sin rotar en bodega', 'La clasificación ABC señala el stock estancado para convertirlo en liquidez.'],
    ['blind', 'Cero visibilidad financiera', 'Registros manuales con errores humanos hacen imposible obtener reportes de auditoría confiables.', 'Conteo manual: ¿cuánto hay de verdad?', 'Historiales y reportes PDF o Excel confiables, con cada acción ligada a su usuario.'],
];
const PILLARS = [
    ['Más ligero que un ERP', 'Olvídate de sistemas complejos y costosos, imposibles de implementar en un negocio en crecimiento.'],
    ['Más seguro que un Excel', 'Cero fórmulas rotas o datos perdidos. Todo se sincroniza de forma automática, centralizada y segura.'],
    ['Fácil y sin fricción', 'Una interfaz intuitiva para dominar el sistema en pocos minutos, sin conocimientos técnicos.'],
];
const COMPARE = {
    excel: { name: 'Excel', rows: [['Se actualiza solo', false], ['Alertas de stock mínimo', false], ['Permisos por rol', false], ['Fácil de aprender', true], ['Datos centralizados y seguros', false]] },
    erp: { name: 'ERP gigante', rows: [['Se actualiza solo', true], ['Alertas de stock mínimo', true], ['Permisos por rol', true], ['Fácil de aprender', false], ['Accesible para una microempresa', false]] },
};
const SECTORS = [
    { short: 'Minimercados', tab: 'Minimercados y tiendas de abastos', t: 'Alta rotación, cero desabastecimiento.', d: 'Control riguroso de lo que más se vende para que nunca falte en el estante.', tags: ['Alta rotación', 'Prevención de desabastecimiento'], items: [['Arroz 500 g', '18 uds', 'good'], ['Aceite 1 L', '7 uds', 'low'], ['Leche 1 L', '0 uds', 'out']] },
    { short: 'Boutiques', tab: 'Boutiques y tiendas de ropa y calzado', t: 'Referencias claras, existencias al día.', d: 'Gestión ordenada de referencias, categorías y existencias de cada colección.', tags: ['Referencias', 'Categorías', 'Existencias'], items: [['Camisa de lino · ref. 214', '24 uds', 'good'], ['Tenis urbano · ref. 087', '3 uds', 'low'], ['Jean clásico · ref. 120', '15 uds', 'good']] },
    { short: 'Ferreterías', tab: 'Ferreterías y comercios técnicos', t: 'Ni una pieza se pierde.', d: 'Organiza inventarios extensos para evitar la pérdida de piezas o repuestos clave.', tags: ['Inventario extenso', 'Piezas y repuestos'], items: [['Tornillo 1/4"', '480 uds', 'good'], ['Broca 3/8"', '4 uds', 'low'], ['Repuesto de grifo', '0 uds', 'out']] },
];

function ProblemVisual({ k }) {
    if (k === 'leak') return <div className="pv pv-leak"><i /></div>;
    if (k === 'gap') return <div className="pv pv-gap">{[0, 1, 2, 3, 4, 5].map((i) => <i key={i} style={{ '--i': i }} className={i > 2 ? 'gone' : ''} />)}</div>;
    if (k === 'lock') return <div className="pv pv-lock">{Array.from({ length: 8 }, (_, i) => <i key={i} style={{ '--i': i }} />)}</div>;
    return <div className="pv pv-blind"><i style={{ width: '90%' }} /><i style={{ width: '65%' }} /><i style={{ width: '78%' }} /><b>?</b></div>;
}

/* ---------- Visuales de la historia ---------- */
function StoryVisual({ k }) {
    if (k === 'catalogo') return (
        <div className="sv sv-table">
            {[['7701…', 'Arroz 500 g', '$2.800', '$3.500'], ['7702…', 'Aceite 1 L', '$9.100', '$11.900'], ['7703…', 'Panela', '$3.200', '$4.200'], ['7704…', 'Detergente', '$6.400', '$8.500']].map((r, i) => (
                <div className="sv-row" key={r[0]} style={{ '--i': i }}><b>{r[1]}</b><span>{r[0]}</span><span>{r[2]}</span><em>{r[3]}</em></div>
            ))}
        </div>);
    if (k === 'mov') return (
        <div className="sv sv-flow">
            {[['Compra', '+120 uds', 'in'], ['Venta', '−3 uds', 'out'], ['Devolución', '+1 ud', 'in'], ['Baja por deterioro', '−2 uds', 'out']].map((r, i) => (
                <div className={`flow-pill ${r[2]}`} key={r[0]} style={{ '--i': i }}><span>{r[0]}</span><b>{r[1]}</b></div>
            ))}
        </div>);
    if (k === 'alert') return (
        <div className="sv sv-alert">
            <div className="bell">🔔<i /><i /></div>
            <strong>Aceite 1 L bajó de su mínimo</strong>
            <span>Quedan 7 uds · mínimo 8</span>
        </div>);
    return (
        <div className="sv sv-files">
            <div className="file pdf"><b>PDF</b><i /><i /><i /></div>
            <div className="file xls"><b>XLSX</b><i /><i /><i /></div>
        </div>);
}

/* ---------- Página ---------- */
function LandingPage() {
    const [scrolled, setScrolled] = useState(false);
    const [menu, setMenu] = useState(false);
    const [stock, setStock] = useState(INITIAL);
    const [toast, setToast] = useState(null);
    const [active, setActive] = useState(0);
    const [role, setRole] = useState('admin');
    const [abc, setAbc] = useState(0);
    const [vs, setVs] = useState('excel');
    const [sector, setSector] = useState(0);
    const [view, setView] = useState('panel');
    const [q, setQ] = useState('');
    const [cat, setCat] = useState('Todas');
    const [wh, setWh] = useState(WAREHOUSES);
    const [tab3, setTab3] = useState('clientes');
    const [log, setLog] = useState([{ t: '08:02', x: 'Entrada · Aceite 1 L · +24 uds' }, { t: '09:15', x: 'Venta · Arroz 500 g · −3 uds' }]);
    const [day, setDay] = useState(0);
    const [dayPause, setDayPause] = useState(false);
    const [faq, setFaq] = useState(0);
    const heroRef = useRef(null);
    const toastT = useRef(null);
    const stepRefs = useRef([]);

    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 10);
            const p = Math.min(window.scrollY / 520, 1);
            heroRef.current?.style.setProperty('--p', p.toFixed(3));
        };
        onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) setActive(Number(e.target.dataset.i)); }), { rootMargin: '-45% 0px -45% 0px' });
        stepRefs.current.forEach((el) => el && io.observe(el));
        return () => io.disconnect();
    }, []);

    useEffect(() => {
        if (dayPause) return;
        const t = setInterval(() => setDay((d) => (d + 1) % DAY.length), 4200);
        return () => clearInterval(t);
    }, [dayPause]);

    const flash = useCallback((msg, type) => {
        setToast({ msg, type }); clearTimeout(toastT.current);
        toastT.current = setTimeout(() => setToast(null), 2600);
    }, []);
    const pushLog = (x) => setLog((l) => [{ t: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }), x }, ...l].slice(0, 5));
    const gen = (name, fmt) => { flash(`Generando ${name} (${fmt})…`, 'ok'); setTimeout(() => { flash(`${name} listo para descargar`, 'ok'); pushLog(`Reporte · ${name} · ${fmt}`); }, 900); };
    const moveWh = (i) => setWh((w) => w.map((x, j) => (j === i ? { ...x, occ: x.occ >= 95 ? x.occ - 30 : Math.min(100, x.occ + 12) } : x)));
    const toggleP = (id) => setStock((s) => s.map((x) => (x.id === id ? { ...x, on: !x.on } : x)));
    const cats = ['Todas', ...new Set(stock.map((p) => p.cat))];
    const shown = stock.filter((p) => (cat === 'Todas' || p.cat === cat) && (p.name + p.code).toLowerCase().includes(q.toLowerCase()));
    const sell = (id) => {
        const p = stock.find((x) => x.id === id); if (!p.stock) return;
        const n = p.stock - 1; pushLog(`Venta · ${p.name} · −1 ud`);
        setStock((s) => s.map((x) => (x.id === id ? { ...x, stock: n } : x)));
        if (n === p.min - 1) flash(`Alerta: ${p.name} bajó de su mínimo`, 'warn');
        else if (n === 0) flash(`${p.name} se agotó`, 'danger');
    };
    const restock = (id) => { pushLog(`Entrada · ${stock.find((x) => x.id === id).name} · +10 uds`); setStock((s) => s.map((x) => (x.id === id ? { ...x, stock: x.stock + 10 } : x))); flash('Entrada registrada: +10 unidades', 'ok'); };
    const alerts = stock.filter((p) => p.stock < p.min).length;
    const total = stock.reduce((a, p) => a + p.stock, 0);

    const spot = (e) => {
        const c = e.target.closest('.bento-card'); if (!c) return;
        const r = c.getBoundingClientRect();
        c.style.setProperty('--mx', `${e.clientX - r.left}px`); c.style.setProperty('--my', `${e.clientY - r.top}px`);
    };

    const links = [['#diagnostico', 'Por qué'], ['#solucion', 'Solución'], ['#historia', 'Cómo funciona'], ['#capacidades', 'Capacidades'], ['#sectores', 'Sectores']];
    const abcData = [['A', 80, '20% de productos'], ['B', 15, '30% de productos'], ['C', 5, '50% de productos']];

    return (
        <div className="landing-scope">
            <header className={`landing-navbar ${scrolled ? 'is-scrolled' : ''}`}>
                <a href="#inicio" className="navbar-brand"><img src={logoStockvelia} alt="" className="navbar-logo" /><span className="brand-name">StockVelia</span></a>
                <button className={`menu-toggle ${menu ? 'open' : ''}`} onClick={() => setMenu(!menu)} aria-label="Abrir menú" aria-expanded={menu}><span /><span /></button>
                <nav className={`navbar-links ${menu ? 'open' : ''}`}>
                    {links.map(([h, l]) => <a key={h} href={h} onClick={() => setMenu(false)}>{l}</a>)}
                    <Link to="/login" className="nav-login">Iniciar sesión</Link>
                    <Link to="/registro" className="pill-btn small">Empezar gratis</Link>
                </nav>
            </header>

            <main>
                {/* HERO */}
                <section id="inicio" className="hero" ref={heroRef}>
                    <div className="hero-glow" aria-hidden="true" />
                    <p className="hero-kicker">Inteligencia financiera para tu negocio</p>
                    <h1 className="hero-title">
                        {['Tu', 'inventario,', 'bajo', 'control.'].map((w, i) => <span key={w} style={{ '--w': i }}>{w}&nbsp;</span>)}
                    </h1>
                    <p className="hero-sub">StockVelia centraliza y protege tu inventario en tiempo real para que dejes de perder dinero en silencio.</p>
                    <div className="hero-actions">
                        <Link to="/registro" className="pill-btn">Empezar gratis</Link>
                        <a href="#producto" className="text-link">Ver el producto en acción ›</a>
                    </div>

                    <div className="stage" id="producto">
                        <div className="device">
                            <div className="device-bar"><i /><i /><i /><span>app.stockvelia.com</span><em><b className="live-dot" /> En vivo</em></div>
                            <div className="device-body">
                                <aside className="device-side" role="tablist">
                                    <img src={logoStockvelia} alt="" />
                                    {VIEWS.map(([k, l]) => <button key={k} role="tab" aria-selected={view === k} className={view === k ? 'on' : ''} onClick={() => setView(k)}>{l}</button>)}
                                </aside>
                                <div className="device-main" key={view}>
                                    {view === 'panel' && (<>
                                        <div className="kpis">
                                            <div><small>Productos</small><b>{stock.length}</b></div>
                                            <div><small>Unidades</small><b key={total} className="bump">{total}</b></div>
                                            <div className={alerts ? 'bad' : 'good'}><small>Alertas</small><b key={alerts} className="bump">{alerts}</b></div>
                                        </div>
                                        <ul className="rows">
                                            {stock.map((p) => {
                                                const st = p.stock === 0 ? 'out' : p.stock < p.min ? 'low' : 'good';
                                                return (
                                                    <li key={p.id} className={st}>
                                                        <div><strong>{p.name}</strong><small>{p.stock} uds · mín. {p.min}</small>
                                                            <div className="meter"><i style={{ width: `${Math.min(100, (p.stock / (p.min * 2)) * 100)}%` }} /></div></div>
                                                        <div className="btns">
                                                            <button onClick={() => sell(p.id)} disabled={!p.stock} aria-label={`Vender ${p.name}`}>−1</button>
                                                            <button className="add" onClick={() => restock(p.id)} aria-label={`Reabastecer ${p.name}`}>+10</button>
                                                        </div>
                                                    </li>);
                                            })}
                                        </ul>
                                    </>)}
                                    {view === 'productos' && (<>
                                        <div className="tools">
                                            <input className="search" placeholder="Buscar producto o código…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar producto" />
                                            <div className="chips2">{cats.map((c) => <button key={c} className={cat === c ? 'on' : ''} onClick={() => setCat(c)}>{c}</button>)}</div>
                                        </div>
                                        <ul className="ptable">
                                            {shown.map((p) => (
                                                <li key={p.id} className={p.on ? '' : 'off'}>
                                                    <div><strong>{p.name}</strong><small>{p.code} · {p.cat}</small></div>
                                                    <span className="price">${p.price.toLocaleString('es-CO')}<small>margen {Math.round(((p.price - p.cost) / p.price) * 100)}%</small></span>
                                                    <button className={`sw ${p.on ? 'on' : ''}`} onClick={() => toggleP(p.id)} aria-label={`${p.on ? 'Desactivar' : 'Activar'} ${p.name}`}><i /></button>
                                                </li>))}
                                            {!shown.length && <li className="empty">Sin resultados. Prueba otro nombre o categoría.</li>}
                                        </ul>
                                    </>)}
                                    {view === 'almacenes' && (
                                        <ul className="whs">
                                            {wh.map((w, i) => {
                                                const st = w.occ >= 95 ? 'bad' : w.occ >= 70 ? 'warn' : 'good';
                                                return (
                                                    <li key={w.name} className={st}>
                                                        <div className="wh-top"><div><strong>{w.name}</strong><small>{w.zone} · Encargado: {w.boss}</small></div><b key={w.occ} className="bump">{w.occ}%</b></div>
                                                        <div className="meter big"><i style={{ width: `${w.occ}%` }} /></div>
                                                        <div className="wh-foot"><small>{st === 'bad' ? 'Capacidad crítica' : st === 'warn' ? 'Ocupación alta' : 'Nivel óptimo'}</small>
                                                            <button onClick={() => moveWh(i)}>{w.occ >= 95 ? 'Trasladar −30%' : 'Recibir carga +12%'}</button></div>
                                                    </li>);
                                            })}
                                        </ul>
                                    )}
                                    {view === 'terceros' && (<>
                                        <div className="role-switch inl">{['clientes', 'proveedores'].map((k) => <button key={k} className={tab3 === k ? 'on' : ''} onClick={() => setTab3(k)}>{k === 'clientes' ? 'Clientes' : 'Proveedores'}</button>)}</div>
                                        <ul className="rows" key={tab3}>
                                            {PARTIES[tab3].map(([n, ph, amt, lbl], i) => (
                                                <li key={n} style={{ animation: `up .5s ${i * 80}ms var(--ease) both` }}><div><strong>{n}</strong><small>{ph}</small></div><span className="amt"><small>{lbl}</small>{amt}</span></li>))}
                                        </ul>
                                    </>)}
                                    {view === 'reportes' && (<>
                                        <div className="rep-grid">
                                            {REPORTS.map(([t, d]) => (
                                                <div key={t} className="rep"><strong>{t}</strong><small>{d}</small>
                                                    <div className="btns"><button onClick={() => gen(t, 'PDF')}>PDF</button><button className="add" onClick={() => gen(t, 'XLSX')}>Excel</button></div></div>))}
                                        </div>
                                        <div className="hist"><small>Historial reciente</small>
                                            {log.map((l, i) => <p key={l.t + l.x + i}><b>{l.t}</b>{l.x}</p>)}</div>
                                    </>)}
                                </div>
                            </div>
                            <div className={`toast ${toast ? `show ${toast.type}` : ''}`} role="status" aria-live="polite">{toast?.msg}</div>
                        </div>
                        <p className="stage-hint">Es una demo real: registra una venta con <b>−1</b> y mira cómo reacciona.</p>
                    </div>
                </section>

                {/* MARQUEE */}
                <div className="marquee" aria-label="Negocios para los que está hecho">
                    <div className="marquee-track">{[...MARQUEE, ...MARQUEE].map((m, i) => <span key={i}>{m}</span>)}</div>
                </div>

                {/* DIAGNÓSTICO */}
                <section id="diagnostico" className="problems">
                    <Reveal as="h2" className="big-h">¿Por qué nace StockVelia?</Reveal>
                    <Reveal as="p" delay={100} className="big-p">La supervivencia de un pequeño negocio depende de su agilidad financiera. Pero casi todos llevan el inventario en cuadernos, hojas de cálculo estáticas o de memoria. Eso deja puntos ciegos que drenan tus finanzas en silencio.</Reveal>
                    <div className="prob-grid">
                        {PROBLEMS.map(([k, t, d, cap, fix], i) => (
                            <Reveal key={k} delay={(i % 2) * 120} className="prob-card"><h3>{t}</h3><p>{d}</p><ProblemVisual k={k} /><small className="pv-cap">{cap}</small><div className="fix"><b>Con StockVelia</b>{fix}</div></Reveal>
                        ))}
                    </div>
                </section>

                {/* SOLUCIÓN */}
                <section id="solucion" className="solution">
                    <Reveal as="h2" className="big-h">No es un software aburrido. Es blindaje para tu capital.</Reveal>
                    <Reveal as="p" delay={100} className="big-p">Herramientas de grandes corporaciones, adaptadas a la realidad del pequeño comerciante.</Reveal>
                    <div className="pillars">
                        {PILLARS.map(([t, d], i) => <Reveal key={t} delay={i * 110} className="pillar"><h3>{t}</h3><p>{d}</p></Reveal>)}
                    </div>
                    <Reveal className="compare">
                        <div className="cmp-head"><div className="role-switch">{Object.entries(COMPARE).map(([k, v]) => <button key={k} className={vs === k ? 'on' : ''} onClick={() => setVs(k)}>vs {v.name}</button>)}</div></div>
                        <div className="cmp-row cmp-top"><span /><span>{COMPARE[vs].name}</span><span className="us">StockVelia</span></div>
                        <div key={vs}>
                            {COMPARE[vs].rows.map(([l, ok], i) => (
                                <div className="cmp-row" key={l} style={{ '--i': i }}>
                                    <span>{l}</span>
                                    <span><i className={`mk ${ok ? 'y' : 'n'}`}>{ok ? '✓' : '✕'}</i></span>
                                    <span className="us"><i className="mk y">✓</i></span>
                                </div>
                            ))}
                        </div>
                    </Reveal>
                </section>

                {/* UN DÍA */}
                <section className="impact">
                    <Reveal as="h2" className="big-h">Un día con StockVelia.</Reveal>
                    <Reveal as="p" delay={100} className="big-p">Desde que llega la mercancía hasta el cierre. Toca cualquier hora para verlo.</Reveal>
                    <div className="day" onMouseEnter={() => setDayPause(true)} onMouseLeave={() => setDayPause(false)}>
                        <ol className="day-times">
                            <i className="day-line" style={{ '--p': day / (DAY.length - 1) }} />
                            {DAY.map((d, i) => (
                                <li key={d.t}><button className={`${day === i ? 'on' : ''} ${i < day ? 'past' : ''}`} onClick={() => setDay(i)}><b>{d.t}</b><span>{d.title}</span></button></li>
                            ))}
                        </ol>
                        <div className="day-card" key={day}>
                            <span className={`day-tag ${DAY[day].kind}`}>{DAY[day].tag}</span>
                            <h3>{DAY[day].title}</h3>
                            <p>{DAY[day].desc}</p>
                            <div className="day-meter"><small>Aceite 1 L · nivel de stock <b>{DAY[day].lvl}%</b></small>
                                <div className="meter big"><i className={DAY[day].kind} style={{ width: `${DAY[day].lvl}%` }} /></div></div>
                            <small className="day-note">Ejemplo ilustrativo</small>
                        </div>
                    </div>
                    <div className="impact-grid">
                        {[[100, '%', 'de movimientos registrados al instante'], [4, '', 'tipos de movimiento: compra, venta, devolución y baja'], [2, '', 'roles con permisos diferenciados']].map(([n, sf, t], i) => (
                            <Reveal key={t} delay={i * 120} className="impact-item"><b><CountUp to={n} suffix={sf} /></b><p>{t}</p></Reveal>
                        ))}
                    </div>
                </section>

                {/* HISTORIA STICKY */}
                <section id="historia" className="story">
                    <div className="story-head"><Reveal as="h2" className="big-h light">Cómo funciona.</Reveal><Reveal as="p" delay={100} className="big-p light">Cuatro ideas simples, un solo sistema.</Reveal></div>
                    <div className="story-grid">
                        <div className="story-steps">
                            {STORY.map((s, i) => (
                                <div key={s.k} data-i={i} ref={(el) => (stepRefs.current[i] = el)} className={`story-step ${active === i ? 'on' : ''}`}>
                                    <span className="step-n">{s.n}</span><h3>{s.t}</h3><p>{s.d}</p>
                                </div>
                            ))}
                        </div>
                        <div className="story-sticky"><div className="story-card" key={STORY[active].k}><StoryVisual k={STORY[active].k} /></div>
                            <div className="story-dots">{STORY.map((s, i) => <i key={s.k} className={active === i ? 'on' : ''} />)}</div></div>
                    </div>
                </section>

                {/* BENTO */}
                <section id="capacidades" className="bento">
                    <Reveal as="h2" className="big-h">Todo lo que necesitas. Nada que sobre.</Reveal>
                    <div className="bento-grid" onMouseMove={spot}>
                        <Reveal className="bento-card b-wide dark">
                            <h3>Alertas en tiempo real</h3><p>Notificaciones visuales cuando un producto toca su mínimo.</p>
                            <div className="alert-stack"><span>Aceite 1 L · quedan 7</span><span>Detergente · quedan 4</span><span>Panela · agotado</span></div>
                        </Reveal>
                        <Reveal delay={80} className="bento-card b-tall">
                            <h3>Clasificación ABC</h3><p>{abcData[abc][2]} generan el <b>{abcData[abc][1]}%</b> de tus ingresos.</p>
                            <div className="abc">{abcData.map(([c, v], i) => (
                                <button key={c} className={abc === i ? 'on' : ''} style={{ '--h': `${Math.max(v, 16)}%` }} onMouseEnter={() => setAbc(i)} onClick={() => setAbc(i)}><span>{c}</span></button>))}</div>
                        </Reveal>
                        <Reveal delay={120} className="bento-card">
                            <h3>Exporta con un clic</h3><p>Historiales por rango de fechas en PDF o Excel para tu contabilidad.</p>
                            <div className="mini-files"><i className="pdf">PDF</i><i className="xls">XLS</i></div>
                        </Reveal>
                        <Reveal delay={160} className="bento-card b-wide">
                            <h3>Seguridad por roles</h3><p>Administradores con visión gerencial y auditoría; operadores para el registro diario.</p>
                            <div className="role-switch">{['admin', 'operador'].map((r) => <button key={r} className={role === r ? 'on' : ''} onClick={() => setRole(r)}>{r === 'admin' ? 'Administrador' : 'Operador'}</button>)}</div>
                            <ul className="perms">{ALL_PERMS.map((p) => <li key={p} className={ROLES[role].includes(p) ? 'yes' : 'no'}><i>{ROLES[role].includes(p) ? '✓' : '✕'}</i>{p}</li>)}</ul>
                        </Reveal>
                        <Reveal delay={200} className="bento-card b-wide accent">
                            <h3>Fácil desde el primer día</h3><p>Una interfaz moderna y responsiva que cualquier comerciante aprende a usar sin capacitación.</p>
                            <ol className="mini-steps"><li>Crea tu cuenta</li><li>Registra tus productos</li><li>Empieza a controlar</li></ol>
                        </Reveal>
                    </div>
                </section>

                {/* SECTORES */}
                <section id="sectores" className="sectors">
                    <Reveal as="h2" className="big-h">Hecho para el comercio de tu barrio.</Reveal>
                    <Reveal as="p" delay={100} className="big-p">Se adapta a comercios locales en fase de formalización y expansión.</Reveal>
                    <div className="sector-grid">
                        <div className="sector-tabs" role="tablist">
                            {SECTORS.map((x, i) => (
                                <button key={x.short} role="tab" aria-selected={sector === i} className={`sector-tab ${sector === i ? 'on' : ''}`} onClick={() => setSector(i)}>
                                    {x.short}<small>{x.tab}</small>
                                </button>
                            ))}
                        </div>
                        <div className="sector-card" key={sector}>
                            <h4>{SECTORS[sector].t}</h4>
                            <p>{SECTORS[sector].d}</p>
                            <div className="tags">{SECTORS[sector].tags.map((t) => <span key={t}>{t}</span>)}</div>
                            <ul>{SECTORS[sector].items.map(([n, q, st], i) => (
                                <li key={n} className={st} style={{ '--i': i }}><span>{n}</span><b>{q}</b></li>
                            ))}</ul>
                        </div>
                    </div>
                </section>

                {/* BENEFICIOS */}
                <section id="beneficios" className="benefits">
                    <Reveal as="h2" className="big-h light">Lo que hace por tu negocio.</Reveal>
                    <div className="benefit-list">
                        {BENEFITS.map(([t, d], i) => (
                            <Reveal key={t} delay={i * 90} className="benefit"><span>{i + 1}</span><div><h3>{t}</h3><p>{d}</p></div></Reveal>
                        ))}
                    </div>
                </section>

                {/* OBJETIVO */}
                <section className="goal">
                    <Reveal as="p" className="goal-text">Nuestro propósito es <mark>blindar el capital operativo</mark> de las PYMES y darles herramientas de grandes corporaciones, de forma accesible y amigable.</Reveal>
                    <div className="objs">
                        {OBJS.map(([t, d], i) => (
                            <Reveal key={t} delay={i * 100} className="obj"><i className="obj-line" /><h4>{t}</h4><p>{d}</p></Reveal>
                        ))}
                    </div>
                </section>

                {/* FAQ */}
                <section id="faq" className="faq">
                    <Reveal as="h2" className="big-h">Preguntas frecuentes.</Reveal>
                    <div className="faq-list">
                        {FAQ.map(([qq, a], i) => (
                            <Reveal key={qq} delay={i * 60} className={`faq-item ${faq === i ? 'open' : ''}`}>
                                <button onClick={() => setFaq(faq === i ? -1 : i)} aria-expanded={faq === i}><span>{qq}</span><i /></button>
                                <div className="faq-a"><p>{a}</p></div>
                            </Reveal>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="cta">
                    <Reveal as="h2" className="big-h light">Convierte tu inventario en liquidez.</Reveal>
                    <Reveal as="p" delay={100} className="big-p light">Crea tu cuenta gratis y empieza hoy.</Reveal>
                    <Reveal delay={200}><Link to="/registro" className="pill-btn white">Crear mi cuenta gratis</Link></Reveal>
                </section>
            </main>

            <footer className="landing-footer">
                <div className="foot-top">
                    <div className="foot-brand"><img src={logoStockvelia} alt="" /><b>StockVelia</b><p>Inteligencia financiera y control de inventarios para tu negocio.</p></div>
                    <div className="foot-col"><h5>Explora</h5>{links.map(([h, l]) => <a key={h} href={h}>{l}</a>)}<a href="#faq">Preguntas</a></div>
                    <div className="foot-col"><h5>Tu cuenta</h5><Link to="/login">Iniciar sesión</Link><Link to="/registro">Crear cuenta</Link></div>
                </div>
                <p className="foot-copy">&copy; {new Date().getFullYear()} StockVelia. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
}
export default LandingPage;