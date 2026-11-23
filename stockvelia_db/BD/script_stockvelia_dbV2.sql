-- ==========================================
-- 1. TABLAS NORMALIZADAS
-- ==========================================
CREATE TABLE public.empresa (
    id_empresa SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    correo VARCHAR(150) NOT NULL,
    color_tema VARCHAR(20) NOT NULL DEFAULT '#6D28D9',
    fecha_registro TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE public.roles (
    id_rol SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE public.permisos (
    id_permiso SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT
);

CREATE TABLE public.roles_permisos (
    id_rol INTEGER NOT NULL,
    id_permiso INTEGER NOT NULL,
    PRIMARY KEY (id_rol, id_permiso),
    CONSTRAINT fk_roles_permisos_rol FOREIGN KEY (id_rol) REFERENCES public.roles(id_rol) ON DELETE CASCADE,
    CONSTRAINT fk_roles_permisos_permiso FOREIGN KEY (id_permiso) REFERENCES public.permisos(id_permiso) ON DELETE CASCADE
);

CREATE TABLE public.usuario (
    id_usuario SERIAL PRIMARY KEY,
    id_empresa INTEGER,
    id_rol INTEGER NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    telefono VARCHAR(30),
    foto_perfil TEXT,
    password TEXT NOT NULL,
    intentos_fallidos INTEGER NOT NULL DEFAULT 0 CHECK (intentos_fallidos >= 0),
    bloqueo_hasta TIMESTAMP WITHOUT TIME ZONE,
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO', 'INACTIVO', 'ELIMINADO')),
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_empresa_principal FOREIGN KEY (id_empresa) REFERENCES public.empresa(id_empresa) ON DELETE SET NULL,
    CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol) REFERENCES public.roles(id_rol)
);

CREATE TABLE public.usuario_empresa (
    id_usuario INTEGER NOT NULL,
    id_empresa INTEGER NOT NULL,
    fecha_vinculacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_usuario, id_empresa),
    CONSTRAINT usuario_empresa_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario) ON DELETE CASCADE,
    CONSTRAINT usuario_empresa_id_empresa_fkey FOREIGN KEY (id_empresa) REFERENCES public.empresa(id_empresa) ON DELETE CASCADE
);

CREATE TABLE public.categorias (
    id_categoria SERIAL PRIMARY KEY,
    id_empresa INTEGER NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    CONSTRAINT uc_nombre_empresa UNIQUE (nombre, id_empresa),
    CONSTRAINT fk_categorias_empresa FOREIGN KEY (id_empresa) REFERENCES public.empresa(id_empresa) ON DELETE CASCADE
);

CREATE TABLE public.productos (
    id_producto SERIAL PRIMARY KEY,
    id_empresa INTEGER NOT NULL,
    id_categoria INTEGER NOT NULL,
    codigo VARCHAR(50) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio NUMERIC(12, 2) NOT NULL CHECK (precio >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    stock_minimo INTEGER NOT NULL DEFAULT 5 CHECK (stock_minimo >= 0),
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO', 'INACTIVO')),
    imagen TEXT,
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT productos_id_empresa_codigo_key UNIQUE (id_empresa, codigo),
    CONSTRAINT fk_empresa_producto FOREIGN KEY (id_empresa) REFERENCES public.empresa(id_empresa) ON DELETE CASCADE,
    CONSTRAINT fk_categoria_producto FOREIGN KEY (id_categoria) REFERENCES public.categorias(id_categoria)
);

CREATE TABLE public.movimientos_inventario (
    id_movimiento SERIAL PRIMARY KEY,
    id_empresa INTEGER NOT NULL,
    id_producto INTEGER NOT NULL,
    id_usuario INTEGER NOT NULL,
    tipo_movimiento VARCHAR(20) NOT NULL CHECK (tipo_movimiento IN ('ENTRADA', 'SALIDA', 'BAJA')),
    motivo VARCHAR(50) NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    justificacion TEXT,
    observacion TEXT,
    fecha TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_justificacion_baja CHECK (
        (
            tipo_movimiento = 'BAJA'
            OR motivo IN ('Baja/Daño', 'DANO', 'OBSOLESCENCIA')
        )
        AND COALESCE(TRIM(justificacion), '') <> ''
        OR (
            tipo_movimiento <> 'BAJA'
            AND motivo NOT IN ('Baja/Daño', 'DANO', 'OBSOLESCENCIA')
        )
    ),
    CONSTRAINT fk_empresa_mov FOREIGN KEY (id_empresa) REFERENCES public.empresa(id_empresa) ON DELETE CASCADE,
    CONSTRAINT fk_producto_mov FOREIGN KEY (id_producto) REFERENCES public.productos(id_producto),
    CONSTRAINT fk_usuario_mov FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario)
);

CREATE TABLE public.auditoria (
    id_auditoria SERIAL PRIMARY KEY,
    id_empresa INTEGER,
    id_usuario INTEGER NOT NULL,
    tabla_afectada VARCHAR(50) NOT NULL,
    accion VARCHAR(30) NOT NULL,
    registro_id INTEGER,
    descripcion TEXT,
    valores_anteriores JSONB,
    valores_nuevos JSONB,
    fecha TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_empresa_auditoria FOREIGN KEY (id_empresa) REFERENCES public.empresa(id_empresa) ON DELETE SET NULL,
    CONSTRAINT fk_usuario_auditoria FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario)
);

CREATE TABLE public.codigos_recuperacion (
    id SERIAL PRIMARY KEY,
    correo VARCHAR(255) NOT NULL,
    codigo VARCHAR(6) NOT NULL,
    expira_en TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

CREATE TABLE public.tokens_blacklist (
    id_token SERIAL PRIMARY KEY,
    token TEXT NOT NULL,
    fecha_expiracion TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    fecha_registro TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 2. FUNCIÓN Y TRIGGER DE STOCK
-- ==========================================
CREATE OR REPLACE FUNCTION public.actualizar_stock()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_stock_actual INTEGER;
    v_nuevo_stock  INTEGER;
BEGIN
    SELECT stock
    INTO v_stock_actual
    FROM public.productos
    WHERE id_producto = NEW.id_producto
      AND id_empresa = NEW.id_empresa
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'El producto con ID % no existe en la empresa %.', NEW.id_producto, NEW.id_empresa;
    END IF;

    IF NEW.cantidad IS NULL OR NEW.cantidad <= 0 THEN
        RAISE EXCEPTION 'La cantidad del movimiento debe ser mayor que cero.';
    END IF;

    IF UPPER(NEW.tipo_movimiento) = 'ENTRADA' THEN
        v_nuevo_stock := v_stock_actual + NEW.cantidad;

    ELSIF UPPER(NEW.tipo_movimiento) IN ('SALIDA', 'BAJA') THEN
        IF v_stock_actual < NEW.cantidad THEN
            RAISE EXCEPTION 'Stock insuficiente para el producto %. Stock actual: %, solicitado: %.',
                NEW.id_producto, v_stock_actual, NEW.cantidad;
        END IF;

        v_nuevo_stock := v_stock_actual - NEW.cantidad;

    ELSE
        RAISE EXCEPTION 'Tipo de movimiento no válido: %.', NEW.tipo_movimiento;
    END IF;

    UPDATE public.productos
    SET stock = v_nuevo_stock,
        fecha_actualizacion = CURRENT_TIMESTAMP
    WHERE id_producto = NEW.id_producto
      AND id_empresa = NEW.id_empresa;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_actualizar_stock ON public.movimientos_inventario;

CREATE TRIGGER trg_actualizar_stock
BEFORE INSERT ON public.movimientos_inventario
FOR EACH ROW
EXECUTE FUNCTION public.actualizar_stock();

-- ==========================================
-- 3. ÍNDICES DE RENDIMIENTO
-- ==========================================
CREATE INDEX idx_productos_empresa_estado ON public.productos (id_empresa, estado);
CREATE INDEX idx_productos_categoria ON public.productos (id_categoria);
CREATE INDEX idx_productos_nombre ON public.productos (nombre);
CREATE INDEX idx_movimientos_producto_fecha ON public.movimientos_inventario (id_producto, fecha DESC);
CREATE INDEX idx_movimientos_empresa_fecha ON public.movimientos_inventario (id_empresa, fecha DESC);
CREATE INDEX idx_auditoria_empresa_fecha ON public.auditoria (id_empresa, fecha DESC);
CREATE INDEX idx_tokens_blacklist_expiracion ON public.tokens_blacklist (fecha_expiracion);

-- ==========================================
-- 4. VISTA
-- ==========================================
CREATE OR REPLACE VIEW public.vista_usuarios AS
SELECT
    u.id_usuario,
    u.nombre,
    u.correo,
    u.telefono,
    r.nombre AS rol,
    u.estado,
    u.id_empresa
FROM
    public.usuario u
    JOIN public.roles r ON r.id_rol = u.id_rol;