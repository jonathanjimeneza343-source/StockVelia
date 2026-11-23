--
-- PostgreSQL database dump
--

\restrict FKGAiEJR3BivRBsiNEWByhh4WFwkQALQCR70OI9PrSten3te2vx2fFTTJS95vom

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

-- Started on 2026-11-04 07:15:40

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 240 (class 1255 OID 82674)
-- Name: actualizar_stock(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.actualizar_stock() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  stock_actual INTEGER;
BEGIN
  SELECT stock INTO stock_actual FROM productos WHERE id_producto = NEW.id_producto;

  IF NEW.tipo_movimiento = 'ENTRADA' THEN
    UPDATE productos
    SET stock = stock + NEW.cantidad
    WHERE id_producto = NEW.id_producto;

  ELSIF NEW.tipo_movimiento IN ('SALIDA', 'BAJA') THEN
    IF stock_actual < NEW.cantidad OR stock_actual IS NULL THEN
      RAISE EXCEPTION 'Operación cancelada: Stock insuficiente para procesar la transacción del producto ID %', NEW.id_producto;
    END IF;

    UPDATE productos
    SET stock = stock - NEW.cantidad
    WHERE id_producto = NEW.id_producto;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION public.actualizar_stock() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 217 (class 1259 OID 82675)
-- Name: auditoria; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auditoria (
    id_auditoria integer NOT NULL,
    id_usuario integer NOT NULL,
    tabla_afectada character varying(50),
    accion character varying(20),
    registro_id integer,
    descripcion text,
    fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.auditoria OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 82681)
-- Name: auditoria_id_auditoria_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.auditoria_id_auditoria_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.auditoria_id_auditoria_seq OWNER TO postgres;

--
-- TOC entry 4923 (class 0 OID 0)
-- Dependencies: 218
-- Name: auditoria_id_auditoria_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.auditoria_id_auditoria_seq OWNED BY public.auditoria.id_auditoria;


--
-- TOC entry 219 (class 1259 OID 82682)
-- Name: categorias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categorias (
    id_categoria integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text,
    id_empresa integer
);


ALTER TABLE public.categorias OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 82687)
-- Name: categorias_id_categoria_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categorias_id_categoria_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categorias_id_categoria_seq OWNER TO postgres;

--
-- TOC entry 4924 (class 0 OID 0)
-- Dependencies: 220
-- Name: categorias_id_categoria_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categorias_id_categoria_seq OWNED BY public.categorias.id_categoria;


--
-- TOC entry 221 (class 1259 OID 82688)
-- Name: codigos_recuperacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.codigos_recuperacion (
    id integer NOT NULL,
    correo character varying(255) NOT NULL,
    codigo character varying(6) NOT NULL,
    expira_en timestamp without time zone NOT NULL
);


ALTER TABLE public.codigos_recuperacion OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 82691)
-- Name: codigos_recuperacion_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.codigos_recuperacion_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.codigos_recuperacion_id_seq OWNER TO postgres;

--
-- TOC entry 4925 (class 0 OID 0)
-- Dependencies: 222
-- Name: codigos_recuperacion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.codigos_recuperacion_id_seq OWNED BY public.codigos_recuperacion.id;


--
-- TOC entry 223 (class 1259 OID 82692)
-- Name: empresa; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.empresa (
    id_empresa integer NOT NULL,
    nombre character varying(150) NOT NULL,
    correo character varying(150) NOT NULL,
    fecha_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    estado boolean DEFAULT true
);


ALTER TABLE public.empresa OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 82697)
-- Name: empresa_id_empresa_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.empresa_id_empresa_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.empresa_id_empresa_seq OWNER TO postgres;

--
-- TOC entry 4926 (class 0 OID 0)
-- Dependencies: 224
-- Name: empresa_id_empresa_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.empresa_id_empresa_seq OWNED BY public.empresa.id_empresa;


--
-- TOC entry 225 (class 1259 OID 82698)
-- Name: movimientos_inventario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.movimientos_inventario (
    id_movimiento integer NOT NULL,
    id_producto integer NOT NULL,
    id_usuario integer NOT NULL,
    tipo_movimiento character varying(20) NOT NULL,
    motivo character varying(50) NOT NULL,
    cantidad integer NOT NULL,
    observacion text,
    fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT movimientos_inventario_cantidad_check CHECK ((cantidad > 0))
);


ALTER TABLE public.movimientos_inventario OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 82705)
-- Name: movimientos_inventario_id_movimiento_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.movimientos_inventario_id_movimiento_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.movimientos_inventario_id_movimiento_seq OWNER TO postgres;

--
-- TOC entry 4927 (class 0 OID 0)
-- Dependencies: 226
-- Name: movimientos_inventario_id_movimiento_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.movimientos_inventario_id_movimiento_seq OWNED BY public.movimientos_inventario.id_movimiento;


--
-- TOC entry 227 (class 1259 OID 82706)
-- Name: permisos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permisos (
    id_permiso integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text
);


ALTER TABLE public.permisos OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 82711)
-- Name: permisos_id_permiso_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.permisos_id_permiso_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.permisos_id_permiso_seq OWNER TO postgres;

--
-- TOC entry 4928 (class 0 OID 0)
-- Dependencies: 228
-- Name: permisos_id_permiso_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.permisos_id_permiso_seq OWNED BY public.permisos.id_permiso;


--
-- TOC entry 229 (class 1259 OID 82712)
-- Name: productos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.productos (
    id_producto integer NOT NULL,
    id_empresa integer NOT NULL,
    id_categoria integer NOT NULL,
    codigo character varying(50) NOT NULL,
    nombre character varying(150) NOT NULL,
    descripcion text,
    precio numeric(12,2) NOT NULL,
    stock integer DEFAULT 0,
    stock_minimo integer DEFAULT 5,
    estado boolean DEFAULT true,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    imagen text,
    CONSTRAINT productos_precio_check CHECK ((precio >= (0)::numeric)),
    CONSTRAINT productos_stock_check CHECK ((stock >= 0)),
    CONSTRAINT productos_stock_minimo_check CHECK ((stock_minimo >= 0))
);


ALTER TABLE public.productos OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 82724)
-- Name: productos_id_producto_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.productos_id_producto_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.productos_id_producto_seq OWNER TO postgres;

--
-- TOC entry 4929 (class 0 OID 0)
-- Dependencies: 230
-- Name: productos_id_producto_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.productos_id_producto_seq OWNED BY public.productos.id_producto;


--
-- TOC entry 231 (class 1259 OID 82725)
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id_rol integer NOT NULL,
    nombre character varying(50) NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 82728)
-- Name: roles_id_rol_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_rol_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_rol_seq OWNER TO postgres;

--
-- TOC entry 4930 (class 0 OID 0)
-- Dependencies: 232
-- Name: roles_id_rol_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_rol_seq OWNED BY public.roles.id_rol;


--
-- TOC entry 233 (class 1259 OID 82729)
-- Name: roles_permisos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles_permisos (
    id_rol integer NOT NULL,
    id_permiso integer NOT NULL
);


ALTER TABLE public.roles_permisos OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 82732)
-- Name: tokens_blacklist; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tokens_blacklist (
    id_token integer NOT NULL,
    token text NOT NULL,
    fecha_expiracion timestamp without time zone NOT NULL,
    fecha_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.tokens_blacklist OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 82738)
-- Name: tokens_blacklist_id_token_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tokens_blacklist_id_token_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tokens_blacklist_id_token_seq OWNER TO postgres;

--
-- TOC entry 4931 (class 0 OID 0)
-- Dependencies: 235
-- Name: tokens_blacklist_id_token_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tokens_blacklist_id_token_seq OWNED BY public.tokens_blacklist.id_token;


--
-- TOC entry 236 (class 1259 OID 82739)
-- Name: usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuario (
    id_usuario integer NOT NULL,
    id_empresa integer NOT NULL,
    id_rol integer NOT NULL,
    nombre character varying(100) NOT NULL,
    correo character varying(150) NOT NULL,
    password text NOT NULL,
    intentos_fallidos integer DEFAULT 0,
    bloqueo_hasta timestamp without time zone,
    estado boolean DEFAULT true,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.usuario OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 90865)
-- Name: usuario_empresa; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuario_empresa (
    id_usuario integer NOT NULL,
    id_empresa integer NOT NULL
);


ALTER TABLE public.usuario_empresa OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 82747)
-- Name: usuario_id_usuario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuario_id_usuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuario_id_usuario_seq OWNER TO postgres;

--
-- TOC entry 4932 (class 0 OID 0)
-- Dependencies: 237
-- Name: usuario_id_usuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuario_id_usuario_seq OWNED BY public.usuario.id_usuario;


--
-- TOC entry 238 (class 1259 OID 82748)
-- Name: vista_usuarios; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vista_usuarios AS
 SELECT nombre,
    correo,
        CASE
            WHEN (id_rol = 1) THEN 'Administrador'::text
            ELSE 'Empleado'::text
        END AS rol,
    estado
   FROM public.usuario;


ALTER VIEW public.vista_usuarios OWNER TO postgres;

--
-- TOC entry 4699 (class 2604 OID 82752)
-- Name: auditoria id_auditoria; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria ALTER COLUMN id_auditoria SET DEFAULT nextval('public.auditoria_id_auditoria_seq'::regclass);


--
-- TOC entry 4701 (class 2604 OID 82753)
-- Name: categorias id_categoria; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias ALTER COLUMN id_categoria SET DEFAULT nextval('public.categorias_id_categoria_seq'::regclass);


--
-- TOC entry 4702 (class 2604 OID 82754)
-- Name: codigos_recuperacion id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.codigos_recuperacion ALTER COLUMN id SET DEFAULT nextval('public.codigos_recuperacion_id_seq'::regclass);


--
-- TOC entry 4703 (class 2604 OID 82755)
-- Name: empresa id_empresa; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresa ALTER COLUMN id_empresa SET DEFAULT nextval('public.empresa_id_empresa_seq'::regclass);


--
-- TOC entry 4706 (class 2604 OID 82756)
-- Name: movimientos_inventario id_movimiento; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_inventario ALTER COLUMN id_movimiento SET DEFAULT nextval('public.movimientos_inventario_id_movimiento_seq'::regclass);


--
-- TOC entry 4708 (class 2604 OID 82757)
-- Name: permisos id_permiso; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permisos ALTER COLUMN id_permiso SET DEFAULT nextval('public.permisos_id_permiso_seq'::regclass);


--
-- TOC entry 4709 (class 2604 OID 82758)
-- Name: productos id_producto; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos ALTER COLUMN id_producto SET DEFAULT nextval('public.productos_id_producto_seq'::regclass);


--
-- TOC entry 4714 (class 2604 OID 82759)
-- Name: roles id_rol; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id_rol SET DEFAULT nextval('public.roles_id_rol_seq'::regclass);


--
-- TOC entry 4715 (class 2604 OID 82760)
-- Name: tokens_blacklist id_token; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tokens_blacklist ALTER COLUMN id_token SET DEFAULT nextval('public.tokens_blacklist_id_token_seq'::regclass);


--
-- TOC entry 4717 (class 2604 OID 82761)
-- Name: usuario id_usuario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario ALTER COLUMN id_usuario SET DEFAULT nextval('public.usuario_id_usuario_seq'::regclass);


--
-- TOC entry 4726 (class 2606 OID 82763)
-- Name: auditoria auditoria_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria
    ADD CONSTRAINT auditoria_pkey PRIMARY KEY (id_auditoria);


--
-- TOC entry 4728 (class 2606 OID 82765)
-- Name: categorias categorias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_pkey PRIMARY KEY (id_categoria);


--
-- TOC entry 4732 (class 2606 OID 82767)
-- Name: codigos_recuperacion codigos_recuperacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.codigos_recuperacion
    ADD CONSTRAINT codigos_recuperacion_pkey PRIMARY KEY (id);


--
-- TOC entry 4734 (class 2606 OID 82771)
-- Name: empresa empresa_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresa
    ADD CONSTRAINT empresa_pkey PRIMARY KEY (id_empresa);


--
-- TOC entry 4736 (class 2606 OID 82773)
-- Name: movimientos_inventario movimientos_inventario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_inventario
    ADD CONSTRAINT movimientos_inventario_pkey PRIMARY KEY (id_movimiento);


--
-- TOC entry 4738 (class 2606 OID 82775)
-- Name: permisos permisos_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permisos
    ADD CONSTRAINT permisos_nombre_key UNIQUE (nombre);


--
-- TOC entry 4740 (class 2606 OID 82777)
-- Name: permisos permisos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permisos
    ADD CONSTRAINT permisos_pkey PRIMARY KEY (id_permiso);


--
-- TOC entry 4742 (class 2606 OID 90881)
-- Name: productos productos_id_empresa_codigo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_id_empresa_codigo_key UNIQUE (id_empresa, codigo);


--
-- TOC entry 4744 (class 2606 OID 82781)
-- Name: productos productos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_pkey PRIMARY KEY (id_producto);


--
-- TOC entry 4746 (class 2606 OID 82783)
-- Name: roles roles_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_nombre_key UNIQUE (nombre);


--
-- TOC entry 4750 (class 2606 OID 82785)
-- Name: roles_permisos roles_permisos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles_permisos
    ADD CONSTRAINT roles_permisos_pkey PRIMARY KEY (id_rol, id_permiso);


--
-- TOC entry 4748 (class 2606 OID 82787)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id_rol);


--
-- TOC entry 4752 (class 2606 OID 82789)
-- Name: tokens_blacklist tokens_blacklist_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tokens_blacklist
    ADD CONSTRAINT tokens_blacklist_pkey PRIMARY KEY (id_token);


--
-- TOC entry 4730 (class 2606 OID 82791)
-- Name: categorias uc_nombre_empresa; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT uc_nombre_empresa UNIQUE (nombre, id_empresa);


--
-- TOC entry 4754 (class 2606 OID 82793)
-- Name: usuario usuario_correo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_correo_key UNIQUE (correo);


--
-- TOC entry 4758 (class 2606 OID 90869)
-- Name: usuario_empresa usuario_empresa_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario_empresa
    ADD CONSTRAINT usuario_empresa_pkey PRIMARY KEY (id_usuario, id_empresa);


--
-- TOC entry 4756 (class 2606 OID 82795)
-- Name: usuario usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (id_usuario);


--
-- TOC entry 4771 (class 2620 OID 82796)
-- Name: movimientos_inventario trg_actualizar_stock; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_actualizar_stock AFTER INSERT ON public.movimientos_inventario FOR EACH ROW EXECUTE FUNCTION public.actualizar_stock();


--
-- TOC entry 4763 (class 2606 OID 82797)
-- Name: productos fk_categoria_producto; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT fk_categoria_producto FOREIGN KEY (id_categoria) REFERENCES public.categorias(id_categoria);


--
-- TOC entry 4760 (class 2606 OID 82802)
-- Name: categorias fk_categorias_empresa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT fk_categorias_empresa FOREIGN KEY (id_empresa) REFERENCES public.empresa(id_empresa) ON DELETE CASCADE;


--
-- TOC entry 4767 (class 2606 OID 82807)
-- Name: usuario fk_empresa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT fk_empresa FOREIGN KEY (id_empresa) REFERENCES public.empresa(id_empresa);


--
-- TOC entry 4764 (class 2606 OID 82812)
-- Name: productos fk_empresa_producto; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT fk_empresa_producto FOREIGN KEY (id_empresa) REFERENCES public.empresa(id_empresa);


--
-- TOC entry 4761 (class 2606 OID 82817)
-- Name: movimientos_inventario fk_producto_mov; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_inventario
    ADD CONSTRAINT fk_producto_mov FOREIGN KEY (id_producto) REFERENCES public.productos(id_producto);


--
-- TOC entry 4768 (class 2606 OID 82822)
-- Name: usuario fk_rol; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT fk_rol FOREIGN KEY (id_rol) REFERENCES public.roles(id_rol);


--
-- TOC entry 4765 (class 2606 OID 82827)
-- Name: roles_permisos fk_roles_permisos_permiso; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles_permisos
    ADD CONSTRAINT fk_roles_permisos_permiso FOREIGN KEY (id_permiso) REFERENCES public.permisos(id_permiso);


--
-- TOC entry 4766 (class 2606 OID 82832)
-- Name: roles_permisos fk_roles_permisos_rol; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles_permisos
    ADD CONSTRAINT fk_roles_permisos_rol FOREIGN KEY (id_rol) REFERENCES public.roles(id_rol);


--
-- TOC entry 4759 (class 2606 OID 82837)
-- Name: auditoria fk_usuario_auditoria; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria
    ADD CONSTRAINT fk_usuario_auditoria FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario);


--
-- TOC entry 4762 (class 2606 OID 82842)
-- Name: movimientos_inventario fk_usuario_mov; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_inventario
    ADD CONSTRAINT fk_usuario_mov FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario);


--
-- TOC entry 4769 (class 2606 OID 90875)
-- Name: usuario_empresa usuario_empresa_id_empresa_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario_empresa
    ADD CONSTRAINT usuario_empresa_id_empresa_fkey FOREIGN KEY (id_empresa) REFERENCES public.empresa(id_empresa) ON DELETE CASCADE;


--
-- TOC entry 4770 (class 2606 OID 90870)
-- Name: usuario_empresa usuario_empresa_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario_empresa
    ADD CONSTRAINT usuario_empresa_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario) ON DELETE CASCADE;


-- Completed on 2026-11-04 07:15:41

--
-- PostgreSQL database dump complete
--

\unrestrict FKGAiEJR3BivRBsiNEWByhh4WFwkQALQCR70OI9PrSten3te2vx2fFTTJS95vom

