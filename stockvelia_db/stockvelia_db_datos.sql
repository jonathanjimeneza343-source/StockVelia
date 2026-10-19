SET TIME ZONE 'America/Bogota';

-- TABLA DE EMPRESAS --------------------------------------------------------------
CREATE TABLE empresa (
    id_empresa VARCHAR(20) PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    correo VARCHAR(150) UNIQUE NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado BOOLEAN default TRUE
);

-- TABLA DE ROLES --------------------------------------------------------------
CREATE TABLE roles (
    id_rol VARCHAR(20) PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL
);

-- TABLA DE USUARIOS --------------------------------------------------------------
CREATE TABLE usuario (
    id_usuario VARCHAR(20) PRIMARY KEY,
    id_empresa VARCHAR(20) NOT NULL,
    id_rol VARCHAR(20) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    intentos_fallidos INTEGER DEFAULT 0,
    bloqueo_hasta TIMESTAMP,
    estado BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_empresa FOREIGN KEY(id_empresa) REFERENCES empresa(id_empresa),
    CONSTRAINT fk_rol FOREIGN KEY(id_rol) REFERENCES roles(id_rol)
);

-- TABLA DE PERMISOS --------------------------------------------------------------
CREATE TABLE permisos (
    id_permiso VARCHAR(20) PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT
);

-- TABLA DE RELACION ROLES PERMISOS --------------------------------------------------------------
CREATE TABLE roles_permisos (
    id_rol VARCHAR(20) NOT NULL,
    id_permiso VARCHAR(20) NOT NULL,
    PRIMARY KEY(id_rol, id_permiso),
    CONSTRAINT fk_roles_permisos_rol FOREIGN KEY(id_rol) REFERENCES roles(id_rol),
    CONSTRAINT fk_roles_permisos_permiso FOREIGN KEY(id_permiso) REFERENCES permisos(id_permiso)
);

-- TABLA DE CATEGORIAS --------------------------------------------------------------
CREATE TABLE categorias (
    id_categoria VARCHAR(20) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT
);

-- TABLA DE PRODUCTOS --------------------------------------------------------------
CREATE TABLE productos (
    id_producto VARCHAR(20) PRIMARY KEY,
    id_empresa VARCHAR(20) NOT NULL,
    id_categoria VARCHAR(20) NOT NULL,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio NUMERIC(12, 2) NOT NULL CHECK(precio >= 0),
    stock INTEGER DEFAULT 0 CHECK (stock >= 0),
    stock_minimo INTEGER DEFAULT 0 CHECK (stock_minimo >= 0),
    estado BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_empresa_producto FOREIGN KEY(id_empresa) REFERENCES empresa(id_empresa),
    CONSTRAINT fk_categoria_producto FOREIGN KEY(id_categoria) REFERENCES categorias(id_categoria)
);

-- TABLA DE MOVIMIENTOS DE INVENTARIO --------------------------------------------------------------
CREATE TABLE movimientos_inventario (
    id_movimiento VARCHAR(20) PRIMARY KEY,
    id_producto VARCHAR(20) NOT NULL,
    id_usuario VARCHAR(20) NOT NULL,
    tipo_movimiento VARCHAR(20) NOT NULL CHECK(tipo_movimiento IN ('ENTRADA', 'SALIDA', 'BAJA')),
    motivo VARCHAR(50) NOT NULL,
    cantidad INTEGER NOT NULL CHECK(cantidad > 0),
    observacion TEXT,
    CONSTRAINT fk_producto_mov FOREIGN KEY(id_producto) REFERENCES productos(id_producto),
    CONSTRAINT fk_usuario_mov FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

-- TABLA DE AUDITORIAS --------------------------------------------------------------
CREATE TABLE auditoria (
    id_auditoria VARCHAR(20) PRIMARY KEY,
    id_usuario VARCHAR(20) NOT NULL,
    tabla_afectada VARCHAR(50),
    accion VARCHAR(20),
    registro_id VARCHAR(20), 
    descripcion TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_auditoria FOREIGN KEY(id_usuario) REFERENCES usuario(id_usuario)
);

-- TABLA DE TOKENS BLACKLIST --------------------------------------------------------------
CREATE TABLE tokens_blacklist (
    id_token VARCHAR(20) PRIMARY KEY,
    token TEXT NOT NULL,
    fecha_expiracion TIMESTAMP NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLA DE CÓDIGOS DE RECUPERACIÓN --------------------------------------------------------------
CREATE TABLE codigos_recuperacion (
    id SERIAL PRIMARY KEY,
    correo VARCHAR(255) NOT NULL,
    codigo VARCHAR(6) NOT NULL,
    expira_en TIMESTAMP NOT NULL
);

-- TRIGGER ======================================================================================
-- AUTOMATIZACIÓN DE STOCK--------------------------------------------------------------
CREATE OR REPLACE FUNCTION actualizar_stock() RETURNS TRIGGER AS $$
DECLARE 
    stock_actual INTEGER;
BEGIN
    SELECT stock INTO stock_actual FROM productos WHERE id_producto = NEW.id_producto;

    IF NEW.tipo_movimiento = 'ENTRADA' THEN
        UPDATE productos SET stock = stock + NEW.cantidad WHERE id_producto = NEW.id_producto;
    ELSIF NEW.tipo_movimiento = 'SALIDA' OR NEW.tipo_movimiento = 'BAJA' THEN 
        IF stock_actual < NEW.cantidad THEN 
            RAISE EXCEPTION 'Stock insuficiente para el producto %', NEW.id_producto;
        END IF;
        UPDATE productos SET stock = stock - NEW.cantidad WHERE id_producto = NEW.id_producto;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_actualizar_stock
AFTER INSERT ON movimientos_inventario 
FOR EACH ROW EXECUTE FUNCTION actualizar_stock();

-- ROLES ========================================================================================
INSERT INTO roles (id_rol, nombre) VALUES 
(1, 'Administrador'),
(2, 'Empleado')
ON CONFLICT (id_rol) DO NOTHING;


-- ================================================================================================================
-- --------------------------------------------------- INSERTS ----------------------------------------------------
-- ================================================================================================================

-- ==============================================================================
-- 1. EMPRESAS (20 inserts)
-- ==============================================================================
INSERT INTO empresa (id_empresa, nombre, correo, estado) VALUES
('EMP-001', 'Tecnología e Innovación S.A.S.', 'contacto@tecinnovacion.com', TRUE),
('EMP-002', 'Comercializadora Global S.A.', 'ventas@comercializadoraglobal.com', TRUE),
('EMP-003', 'Soluciones Logísticas del Norte', 'soporte@logisticanorte.com', TRUE),
('EMP-004', 'Distribuidora Andina Ltda.', 'info@distribuidoraandina.com', TRUE),
('EMP-005', 'Sistemas e Informática Avanzada', 'contacto@sistemasavanzados.com', TRUE),
('EMP-006', 'Servicios Integrales de Colombia', 'atencion@serviciosintegrales.com', TRUE),
('EMP-007', 'Importadora El Dorado', 'contacto@eldoradoimport.com', TRUE),
('EMP-008', 'Inversiones Pacífico S.A.S.', 'administracion@inversionespacifico.com', TRUE),
('EMP-009', 'Redes y Telecomunicaciones BGT', 'soporte@redesbgt.com', TRUE),
('EMP-010', 'Consultoría Empresarial Alfa', 'contacto@alfaconsultoria.com', TRUE),
('EMP-011', 'Suministros Industriales Express', 'ventas@suministrosexpress.com', TRUE),
('EMP-012', 'Desarrollo de Software Nexus', 'info@nexusdev.com', TRUE),
('EMP-013', 'Comercial Neiva & Cía.', 'contacto@comercialneiva.com', TRUE),
('EMP-014', 'Multiservicios del Caribe', 'gerencia@multiservicioscaribe.com', TRUE),
('EMP-015', 'Soluciones Cloud Colombia', 'contacto@cloudcolombia.com', TRUE),
('EMP-016', 'Punto de Venta Directo S.A.S.', 'ventas@puntodeventa.com', TRUE),
('EMP-017', 'Insumos Tecnológicos del Sur', 'info@insumostec.com', TRUE),
('EMP-018', 'Grupo Logístico Santander', 'contacto@gruposantanderlog.com', TRUE),
('EMP-019', 'Electrónica y Automatización CUN', 'soporte@electronicaaut.com', TRUE),
('EMP-020', 'Almacenes la Sabana', 'contacto@lasabana.com', TRUE);

-- ==============================================================================
-- 2. ROLES (20 inserts)
-- ==============================================================================
INSERT INTO roles (id_rol, nombre) VALUES
('ROL-01', 'Administrador General'),
('ROL-02', 'Empleado de Inventario'),
('ROL-03', 'Supervisora de Ventas'),
('ROL-04', 'Auditor de Sistema'),
('ROL-05', 'Gerente de Operaciones'),
('ROL-06', 'Analista de Compras'),
('ROL-07', 'Soporte Técnico'),
('ROL-08', 'Coordinador de Logística'),
('ROL-09', 'Auxiliar de Bodega'),
('ROL-10', 'Contador Principal'),
('ROL-11', 'Asistente Administrativo'),
('ROL-12', 'Jefe de Seguridad'),
('ROL-13', 'Especialista en QA'),
('ROL-14', 'Gestor de Clientes'),
('ROL-15', 'Director de TI'),
('ROL-16', 'Facturador'),
('ROL-17', 'Consultor Externo'),
('ROL-18', 'Líder de Proyecto'),
('ROL-19', 'Operador de Turno'),
('ROL-20', 'Usuario Invitado')
ON CONFLICT (id_rol) DO NOTHING;

-- ==============================================================================
-- 3. USUARIOS (20 inserts)
-- ==============================================================================
INSERT INTO usuario (id_usuario, id_empresa, id_rol, nombre, correo, password, estado) VALUES
('USR-001', 'EMP-001', 'ROL-01', 'Carlos Alberto Pérez', 'carlos.perez@tecinnovacion.com', '$2a$12$EjemploHash12345678901', TRUE),
('USR-002', 'EMP-001', 'ROL-02', 'Ana María Gómez', 'ana.gomez@tecinnovacion.com', '$2a$12$EjemploHash12345678902', TRUE),
('USR-003', 'EMP-002', 'ROL-03', 'Juan David Rodríguez', 'juan.rodriguez@comercializadoraglobal.com', '$2a$12$EjemploHash12345678903', TRUE),
('USR-004', 'EMP-002', 'ROL-04', 'Laura Camila Martínez', 'laura.martinez@comercializadoraglobal.com', '$2a$12$EjemploHash12345678904', TRUE),
('USR-005', 'EMP-003', 'ROL-05', 'Andrés Felipe López', 'andres.lopez@logisticanorte.com', '$2a$12$EjemploHash12345678905', TRUE),
('USR-006', 'EMP-003', 'ROL-09', 'Edna María Rodríguez', 'edna.rodriguez@logisticanorte.com', '$2a$12$EjemploHash12345678906', TRUE),
('USR-007', 'EMP-004', 'ROL-06', 'Santiago Castro', 'santiago.castro@distribuidoraandina.com', '$2a$12$EjemploHash12345678907', TRUE),
('USR-008', 'EMP-004', 'ROL-08', 'Diana Valentina Torres', 'diana.torres@distribuidoraandina.com', '$2a$12$EjemploHash12345678908', TRUE),
('USR-009', 'EMP-005', 'ROL-07', 'Jonathan Aguilera', 'jonathan.aguilera@sistemasavanzados.com', '$2a$12$EjemploHash12345678909', TRUE),
('USR-10', 'EMP-005', 'ROL-15', 'Paula Andrea Ramírez', 'paula.ramirez@sistemasavanzados.com', '$2a$12$EjemploHash12345678910', TRUE),
('USR-011', 'EMP-006', 'ROL-10', 'Mateo Morales', 'mateo.morales@serviciosintegrales.com', '$2a$12$EjemploHash12345678911', TRUE),
('USR-012', 'EMP-007', 'ROL-11', 'Sofia Vargas', 'sofia.vargas@eldoradoimport.com', '$2a$12$EjemploHash12345678912', TRUE),
('USR-013', 'EMP-008', 'ROL-12', 'Gabriel Jiménez', 'gabriel.jimenez@inversionespacifico.com', '$2a$12$EjemploHash12345678913', TRUE),
('USR-014', 'EMP-009', 'ROL-13', 'Mariana Herrera', 'mariana.herrera@redesbgt.com', '$2a$12$EjemploHash12345678914', TRUE),
('USR-015', 'EMP-010', 'ROL-14', 'Daniel Fernando Silva', 'daniel.silva@alfaconsultoria.com', '$2a$12$EjemploHash12345678915', TRUE),
('USR-016', 'EMP-011', 'ROL-16', 'Camila Osorio', 'camila.osorio@suministrosexpress.com', '$2a$12$EjemploHash12345678916', TRUE),
('USR-017', 'EMP-012', 'ROL-18', 'Alejandro Ruiz', 'alejandro.ruiz@nexusdev.com', '$2a$12$EjemploHash12345678917', TRUE),
('USR-018', 'EMP-013', 'ROL-19', 'Natalia Cruz', 'natalia.cruz@comercialneiva.com', '$2a$12$EjemploHash12345678918', TRUE),
('USR-019', 'EMP-014', 'ROL-02', 'Jorge Eduardo Reyes', 'jorge.reyes@multiservicioscaribe.com', '$2a$12$EjemploHash12345678919', TRUE),
('USR-020', 'EMP-015', 'ROL-01', 'Valentina Ríos', 'valentina.rios@cloudcolombia.com', '$2a$12$EjemploHash12345678920', TRUE);

-- ==============================================================================
-- 4. PERMISOS (20 inserts)
-- ==============================================================================
INSERT INTO permisos (id_permiso, nombre, descripcion) VALUES
('PERM-001', 'USUARIOS_CREAR', 'Permite crear nuevos usuarios en la plataforma'),
('PERM-002', 'USUARIOS_EDITAR', 'Permite modificar la información de usuarios existentes'),
('PERM-003', 'USUARIOS_ELIMINAR', 'Permite desactivar o borrar usuarios'),
('PERM-004', 'PRODUCTOS_CREAR', 'Permite registrar nuevos productos en el catálogo'),
('PERM-005', 'PRODUCTOS_EDITAR', 'Permite cambiar precios, descripciones y datos de productos'),
('PERM-006', 'INVENTARIO_ENTRADA', 'Permite registrar entradas de inventario'),
('PERM-007', 'INVENTARIO_SALIDA', 'Permite registrar salidas de inventario por ventas'),
('PERM-008', 'INVENTARIO_BAJA', 'Permite registrar bajas de inventario por merma o daño'),
('PERM-009', 'REPORTES_VER', 'Permite consultar e imprimir reportes generales'),
('PERM-010', 'AUDITORIA_VER', 'Permite revisar los registros de auditoría del sistema'),
('PERM-011', 'ROLES_GESTIONAR', 'Permite asignar y modificar roles y permisos'),
('PERM-012', 'EMPRESA_EDITAR', 'Permite cambiar los datos corporativos de la empresa'),
('PERM-013', 'CATEGORIAS_GESTIONAR', 'Permite crear y editar categorías de productos'),
('PERM-014', 'CLAVE_RESETEAR', 'Permite solicitar y ejecutar el reseteo de contraseñas'),
('PERM-015', 'CONFIGURACION_AVANZADA', 'Acceso a parámetros globales del sistema'),
('PERM-016', 'EXPORTAR_DATOS', 'Permite exportar datos a formatos Excel y PDF'),
('PERM-017', 'IMPORTAR_DATOS', 'Permite carga masiva de registros al sistema'),
('PERM-018', 'ALERTAS_VER', 'Permite recibir y visualizar alertas de stock bajo'),
('PERM-019', 'TOKENS_REVOCAR', 'Permite invalidar sesiones y tokens activos'),
('PERM-020', 'MONITOREO_SISTEMA', 'Permite ver logs y estado de salud de los servicios');

-- ==============================================================================
-- 5. ROLES_PERMISOS (20 inserts)
-- ==============================================================================
INSERT INTO roles_permisos (id_rol, id_permiso) VALUES
('ROL-01', 'PERM-001'),
('ROL-01', 'PERM-002'),
('ROL-01', 'PERM-003'),
('ROL-01', 'PERM-010'),
('ROL-01', 'PERM-011'),
('ROL-02', 'PERM-004'),
('ROL-02', 'PERM-005'),
('ROL-02', 'PERM-006'),
('ROL-02', 'PERM-007'),
('ROL-02', 'PERM-008'),
('ROL-03', 'PERM-007'),
('ROL-03', 'PERM-009'),
('ROL-04', 'PERM-009'),
('ROL-04', 'PERM-010'),
('ROL-05', 'PERM-009'),
('ROL-05', 'PERM-012'),
('ROL-06', 'PERM-006'),
('ROL-06', 'PERM-013'),
('ROL-09', 'PERM-006'),
('ROL-09', 'PERM-007');

-- ==============================================================================
-- 6. CATEGORIAS (20 inserts)
-- ==============================================================================
INSERT INTO categorias (id_categoria, nombre, descripcion) VALUES
('CAT-001', 'Computadores y Laptops', 'Equipos portátiles y de escritorio'),
('CAT-002', 'Periféricos y Accesorios', 'Teclados, mouses, hubs y cables'),
('CAT-003', 'Monitores y Pantallas', 'Pantallas LED, OLED y monitores gamer'),
('CAT-004', 'Redes y Conectividad', 'Routers, switches, cables de red y adaptadores'),
('CAT-005', 'Almacenamiento', 'Discos duros SSD, HDD y memorias USB'),
('CAT-006', 'Componentes de Hardware', 'Tarjetas madre, procesadores y memorias RAM'),
('CAT-007', 'Audio y Micrófonos', 'Diademas, parlantes y micrófonos profesionales'),
('CAT-008', 'Muebles de Oficina', 'Sillas ergonómicas, bases de laptop y escritorios'),
('CAT-009', 'Suministros de Impresión', 'Tóneres, cartuchos de tinta y papel bond'),
('CAT-010', 'Energía y Protección', 'UPS, reguladores de voltaje y multicontactos'),
('CAT-011', 'Cámaras y Video', 'Webcams, cámaras de seguridad y accesorios'),
('CAT-012', 'Software y Licencias', 'Sistemas operativos, antivirus y licencias cloud'),
('CAT-013', 'Instrumentos de Medición', 'Multímetros, probadores de red y herramientas'),
('CAT-014', 'Celulares y Tablets', 'Dispositivos móviles corporativos y accesorios'),
('CAT-015', 'Papelería y Útiles', 'Carpetas, esferos y cuadernos corporativos'),
('CAT-016', 'Limpieza Técnica', 'Aire comprimido, alcohol isopropílico y paños'),
('CAT-017', 'Seguridad Electrónica', 'Lectores biométricos y controles de acceso'),
('CAT-018', 'Servidores y Racks', 'Servidores de gabinete, racks y organizadores'),
('CAT-019', 'Cables y Adaptadores', 'Cables HDMI, DisplayPort, USB-C y VGA'),
('CAT-020', 'Herramientas de Ensamblaje', 'Kits de destornilladores y cautines');

-- ==============================================================================
-- 7. PRODUCTOS (20 inserts)
-- ==============================================================================
-- Nota: Inicializamos el stock en 0 para que los movimientos de entrada posteriores actualicen el stock mediante el trigger.
INSERT INTO productos (id_producto, id_empresa, id_categoria, codigo, nombre, descripcion, precio, stock, stock_minimo, estado) VALUES
('PROD-001', 'EMP-001', 'CAT-001', 'SKU-001', 'Laptop Pro 14 pulgadas', 'Procesador Intel i7, 16GB RAM, SSD 512GB', 3500000.00, 0, 5, TRUE),
('PROD-002', 'EMP-001', 'CAT-002', 'SKU-002', 'Mouse Gamer Inalámbrico G305', 'Sensor óptico alta precisión, color negro', 180000.00, 0, 10, TRUE),
('PROD-003', 'EMP-001', 'CAT-002', 'SKU-003', 'Teclado Mecánico Redragon Kumara', 'Switch Red, retroiluminación RGB', 220000.00, 0, 8, TRUE),
('PROD-004', 'EMP-001', 'CAT-002', 'SKU-004', 'Hub USB-C Multiport 11 en 1', 'Puertos HDMI, VGA, RJ45, USB 3.0, SD', 140000.00, 0, 15, TRUE),
('PROD-005', 'EMP-001', 'CAT-008', 'SKU-005', 'Base de Aluminio para Laptop', 'Soporte ergonómico ajustable en altura', 85000.00, 0, 10, TRUE),
('PROD-006', 'EMP-002', 'CAT-003', 'SKU-006', 'Monitor IPS 27 pulgadas Full HD', 'Tasa de refresco 75Hz, HDMI/VGA', 750000.00, 0, 4, TRUE),
('PROD-007', 'EMP-002', 'CAT-005', 'SKU-007', 'Disco Duro Externo 2TB', 'Conexión USB 3.0 resistente a impactos', 320000.00, 0, 6, TRUE),
('PROD-008', 'EMP-003', 'CAT-004', 'SKU-008', 'Router Gigabit Dual Band', 'Wi-Fi 6 velocidad hasta 1800 Mbps', 260000.00, 0, 5, TRUE),
('PROD-009', 'EMP-003', 'CAT-009', 'SKU-009', 'Resma Papel Carta 75g x 500', 'Papel multipropósito para impresión', 19500.00, 0, 30, TRUE),
('PROD-010', 'EMP-004', 'CAT-010', 'SKU-010', 'UPS Interactiva 1000VA', 'Protección contra sobretensiones y apagones', 410000.00, 0, 3, TRUE),
('PROD-011', 'EMP-005', 'CAT-007', 'SKU-011', 'Diadema con Micrófono USB', 'Cancelación de ruido ideal para Call Center', 115000.00, 0, 12, TRUE),
('PROD-012', 'EMP-006', 'CAT-011', 'SKU-012', 'Webcam Full HD 1080p', 'Micrófono estéreo integrado y enfoque automático', 135000.00, 0, 8, TRUE),
('PROD-013', 'EMP-007', 'CAT-019', 'SKU-013', 'Cable Carga Rápida USB-C a USB-C', 'Longitud 2 metros, soporta 60W Power Delivery', 35000.00, 0, 25, TRUE),
('PROD-014', 'EMP-008', 'CAT-006', 'SKU-014', 'Memoria RAM DDR4 16GB 3200MHz', 'Para PC de escritorio', 210000.00, 0, 10, TRUE),
('PROD-015', 'EMP-009', 'CAT-005', 'SKU-015', 'SSD NVMe M.2 1TB', 'Velocidad de lectura hasta 3500 MB/s', 380000.00, 0, 8, TRUE),
('PROD-016', 'EMP-010', 'CAT-016', 'SKU-016', 'Lata Aire Comprimido 400ml', 'Para limpieza de circuitos y teclados', 28000.00, 0, 20, TRUE),
('PROD-017', 'EMP-011', 'CAT-020', 'SKU-017', 'Kit Herramientas Precision 60 en 1', 'Para reparación de laptops y celulares', 78000.00, 0, 5, TRUE),
('PROD-018', 'EMP-012', 'CAT-017', 'SKU-018', 'Lector Biométrico Huella USB', 'Compatible con Windows Hello y SDK', 165000.00, 0, 4, TRUE),
('PROD-019', 'EMP-013', 'CAT-014', 'SKU-019', 'Tablet 10 pulgadas Android 13', '4GB RAM, 64GB Almacenamiento', 590000.00, 0, 6, TRUE),
('PROD-020', 'EMP-014', 'CAT-008', 'SKU-020', 'Silla de Oficina Ergonómica Malla', 'Soporte lumbar ajustable y brazos 2D', 480000.00, 0, 4, TRUE);

-- ==============================================================================
-- 8. MOVIMIENTOS DE INVENTARIO (20 inserts)
-- ==============================================================================
-- IMPORTANTE: Al ejecutar estos INSERTs, el Trigger "trg_actualizar_stock" 
-- calculará automáticamente el valor del stock en la tabla "productos".
INSERT INTO movimientos_inventario (id_movimiento, id_producto, id_usuario, tipo_movimiento, motivo, cantidad, observacion) VALUES
('MOV-001', 'PROD-001', 'USR-001', 'ENTRADA', 'Compra Inicial', 15, 'Ingreso inicial por factura de compra'),
('MOV-002', 'PROD-002', 'USR-002', 'ENTRADA', 'Compra Inicial', 30, 'Lote recibido de proveedor'),
('MOV-003', 'PROD-003', 'USR-002', 'ENTRADA', 'Compra Inicial', 25, 'Stock inicial para bodega principal'),
('MOV-004', 'PROD-004', 'USR-001', 'ENTRADA', 'Compra Inicial', 40, 'Recepción de importación'),
('MOV-005', 'PROD-005', 'USR-002', 'ENTRADA', 'Compra Inicial', 20, 'Ingreso de mercancía nueva'),
('MOV-006', 'PROD-001', 'USR-002', 'SALIDA', 'Venta Directa', 3, 'Venta a cliente corporativo'),
('MOV-007', 'PROD-002', 'USR-002', 'SALIDA', 'Venta Directa', 5, 'Factura de venta Nro. 1024'),
('MOV-008', 'PROD-003', 'USR-006', 'SALIDA', 'Venta Directa', 2, 'Despacho a sucursal regional'),
('MOV-009', 'PROD-004', 'USR-001', 'BAJA', 'Daño de Fábrica', 1, 'Equipo con puerto HDMI defectuoso'),
('MOV-010', 'PROD-006', 'USR-003', 'ENTRADA', 'Compra Inicial', 12, 'Recepción de monitores'),
('MOV-011', 'PROD-007', 'USR-003', 'ENTRADA', 'Compra Inicial', 18, 'Ingreso de discos externos'),
('MOV-012', 'PROD-008', 'USR-005', 'ENTRADA', 'Compra Inicial', 10, 'Lote routers Wi-Fi 6'),
('MOV-013', 'PROD-009', 'USR-005', 'ENTRADA', 'Compra Inicial', 100, 'Recepción resmas de papel'),
('MOV-014', 'PROD-010', 'USR-007', 'ENTRADA', 'Compra Inicial', 8, 'Ingreso de UPS corporativas'),
('MOV-015', 'PROD-011', 'USR-009', 'ENTRADA', 'Compra Inicial', 25, 'Ingreso diademas telefónicas'),
('MOV-016', 'PROD-012', 'USR-011', 'ENTRADA', 'Compra Inicial', 15, 'Lote webcams Full HD'),
('MOV-017', 'PROD-013', 'USR-012', 'ENTRADA', 'Compra Inicial', 50, 'Cables USB-C stock general'),
('MOV-018', 'PROD-014', 'USR-013', 'ENTRADA', 'Compra Inicial', 20, 'Memorias RAM para ensamble'),
('MOV-019', 'PROD-015', 'USR-014', 'ENTRADA', 'Compra Inicial', 15, 'Discos SSD NVMe'),
('MOV-020', 'PROD-009', 'USR-006', 'SALIDA', 'Consumo Interno', 10, 'Papelería para oficinas administrativas');

-- ==============================================================================
-- 9. AUDITORIAS (20 inserts)
-- ==============================================================================
INSERT INTO auditoria (id_auditoria, id_usuario, tabla_afectada, accion, registro_id, descripcion) VALUES
('AUD-001', 'USR-001', 'empresa', 'INSERT', 'EMP-001', 'Creación de la empresa Tecnología e Innovación S.A.S.'),
('AUD-002', 'USR-001', 'usuario', 'INSERT', 'USR-002', 'Registro del nuevo usuario Ana María Gómez'),
('AUD-003', 'USR-002', 'productos', 'INSERT', 'PROD-001', 'Registro de nuevo producto Laptop Pro 14'),
('AUD-004', 'USR-002', 'productos', 'INSERT', 'PROD-002', 'Registro de nuevo producto Mouse Gamer G305'),
('AUD-005', 'USR-001', 'movimientos_inventario', 'INSERT', 'MOV-001', 'Registro de movimiento de entrada para PROD-001'),
('AUD-006', 'USR-002', 'movimientos_inventario', 'INSERT', 'MOV-006', 'Registro de movimiento de salida por venta de PROD-001'),
('AUD-007', 'USR-001', 'permisos', 'INSERT', 'PERM-001', 'Creación del permiso USUARIOS_CREAR'),
('AUD-008', 'USR-001', 'roles_permisos', 'INSERT', 'ROL-01', 'Asignación de permisos al rol Administrador'),
('AUD-009', 'USR-003', 'empresa', 'INSERT', 'EMP-002', 'Registro de la empresa Comercializadora Global'),
('AUD-010', 'USR-003', 'productos', 'INSERT', 'PROD-006', 'Creación de producto Monitor IPS 27'),
('AUD-011', 'USR-005', 'productos', 'INSERT', 'PROD-008', 'Creación del producto Router Gigabit'),
('AUD-012', 'USR-007', 'productos', 'INSERT', 'PROD-010', 'Registro de UPS 1000VA'),
('AUD-013', 'USR-009', 'usuario', 'UPDATE', 'USR-009', 'Actualización de perfil de usuario Jonathan Aguilera'),
('AUD-014', 'USR-001', 'movimientos_inventario', 'INSERT', 'MOV-009', 'Registro de baja por daño de producto PROD-004'),
('AUD-015', 'USR-011', 'categorias', 'INSERT', 'CAT-011', 'Creación de la categoría Cámaras y Video'),
('AUD-016', 'USR-013', 'productos', 'INSERT', 'PROD-014', 'Creación de producto Memoria RAM DDR4'),
('AUD-017', 'USR-014', 'productos', 'INSERT', 'PROD-015', 'Ingreso de SSD NVMe al catálogo'),
('AUD-018', 'USR-015', 'empresa', 'UPDATE', 'EMP-010', 'Modificación de correo de contacto corporativo'),
('AUD-019', 'USR-017', 'productos', 'INSERT', 'PROD-018', 'Registro de Lector Biométrico'),
('AUD-020', 'USR-020', 'usuario', 'LOGIN', 'USR-020', 'Inicio de sesión exitoso en el sistema');

-- ==============================================================================
-- 10. TOKENS BLACKLIST (20 inserts)
-- ==============================================================================
INSERT INTO tokens_blacklist (id_token, token, fecha_expiracion) VALUES
('TKN-001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVU1ItMDAxIn0.token1', '2026-10-20 12:00:00'),
('TKN-002', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVU1ItMDAyIn0.token2', '2026-10-20 12:30:00'),
('TKN-003', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVU1ItMDAzIn0.token3', '2026-10-20 13:00:00'),
('TKN-004', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVU1ItMDA0In0.token4', '2026-10-20 13:30:00'),
('TKN-005', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVU1ItMDA1In0.token5', '2026-10-20 14:00:00'),
('TKN-006', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVU1ItMDA2In0.token6', '2026-10-20 14:30:00'),
('TKN-007', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVU1ItMDA3In0.token7', '2026-10-20 15:00:00'),
('TKN-008', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVU1ItMDA4In0.token8', '2026-10-20 15:30:00'),
('TKN-009', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVU1ItMDA5In0.token9', '2026-10-20 16:00:00'),
('TKN-010', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVU1ItMDEwIn0.token10', '2026-10-20 16:30:00'),
('TKN-011', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVU1ItMDExIn0.token11', '2026-10-20 17:00:00'),
('TKN-012', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVU1ItMDEyIn0.token12', '2026-10-20 17:30:00'),
('TKN-013', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVU1ItMDEzIn0.token13', '2026-10-20 18:00:00'),
('TKN-014', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVU1ItMDE0In0.token14', '2026-10-20 18:30:00'),
('TKN-015', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVU1ItMDE1In0.token15', '2026-10-20 19:00:00'),
('TKN-016', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVU1ItMDE2In0.token16', '2026-10-20 19:30:00'),
('TKN-017', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVU1ItMDE3In0.token17', '2026-10-20 20:00:00'),
('TKN-018', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVU1ItMDE4In0.token18', '2026-10-20 20:30:00'),
('TKN-019', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVU1ItMDE5In0.token19', '2026-10-20 21:00:00'),
('TKN-020', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVU1ItMDIwIn0.token20', '2026-10-20 21:30:00');

-- ==============================================================================
-- 11. CODIGOS DE RECUPERACIÓN (20 inserts)
-- ==============================================================================
-- Nota: 'id' es de tipo SERIAL, por lo que la base de datos autogenerará los valores primarios.
INSERT INTO codigos_recuperacion (correo, codigo, expira_en) VALUES
('carlos.perez@tecinnovacion.com', '482910', CURRENT_TIMESTAMP + INTERVAL '15 minutes'),
('ana.gomez@tecinnovacion.com', '193847', CURRENT_TIMESTAMP + INTERVAL '15 minutes'),
('juan.rodriguez@comercializadoraglobal.com', '582014', CURRENT_TIMESTAMP + INTERVAL '15 minutes'),
('laura.martinez@comercializadoraglobal.com', '930182', CURRENT_TIMESTAMP + INTERVAL '15 minutes'),
('andres.lopez@logisticanorte.com', '741258', CURRENT_TIMESTAMP + INTERVAL '15 minutes'),
('edna.rodriguez@logisticanorte.com', '369258', CURRENT_TIMESTAMP + INTERVAL '15 minutes'),
('santiago.castro@distribuidoraandina.com', '159357', CURRENT_TIMESTAMP + INTERVAL '15 minutes'),
('diana.torres@distribuidoraandina.com', '852963', CURRENT_TIMESTAMP + INTERVAL '15 minutes'),
('jonathan.aguilera@sistemasavanzados.com', '123456', CURRENT_TIMESTAMP + INTERVAL '15 minutes'),
('paula.ramirez@sistemasavanzados.com', '654321', CURRENT_TIMESTAMP + INTERVAL '15 minutes'),
('mateo.morales@serviciosintegrales.com', '987654', CURRENT_TIMESTAMP + INTERVAL '15 minutes'),
('sofia.vargas@eldoradoimport.com', '456789', CURRENT_TIMESTAMP + INTERVAL '15 minutes'),
('gabriel.jimenez@inversionespacifico.com', '789123', CURRENT_TIMESTAMP + INTERVAL '15 minutes'),
('mariana.herrera@redesbgt.com', '321654', CURRENT_TIMESTAMP + INTERVAL '15 minutes'),
('daniel.silva@alfaconsultoria.com', '147258', CURRENT_TIMESTAMP + INTERVAL '15 minutes'),
('camila.osorio@suministrosexpress.com', '258369', CURRENT_TIMESTAMP + INTERVAL '15 minutes'),
('alejandro.ruiz@nexusdev.com', '369147', CURRENT_TIMESTAMP + INTERVAL '15 minutes'),
('natalia.cruz@comercialneiva.com', '951753', CURRENT_TIMESTAMP + INTERVAL '15 minutes'),
('jorge.reyes@multiservicioscaribe.com', '753951', CURRENT_TIMESTAMP + INTERVAL '15 minutes'),
('valentina.rios@cloudcolombia.com', '842615', CURRENT_TIMESTAMP + INTERVAL '15 minutes');

-- ==============================================================================
-- CONSULTAS GENERALES Y RELACIONALES
-- ==============================================================================

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

SELECT * FROM empresa;

SELECT * FROM roles;

SELECT 
    u.id_usuario, 
    u.nombre AS usuario, 
    u.correo, 
    e.nombre AS empresa, 
    r.nombre AS rol, 
    u.estado,
    u.fecha_creacion
FROM usuario u
JOIN empresa e ON u.id_empresa = e.id_empresa
JOIN roles r ON u.id_rol = r.id_rol;

SELECT * FROM permisos;

SELECT 
    r.nombre AS rol, 
    p.nombre AS permiso,
    p.descripcion
FROM roles_permisos rp
JOIN roles r ON rp.id_rol = r.id_rol
JOIN permisos p ON rp.id_permiso = p.id_permiso;

SELECT * FROM categorias;

SELECT 
    p.id_producto, 
    p.codigo, 
    p.nombre AS producto, 
    c.nombre AS categoria, 
    p.precio, 
    p.stock, 
    p.stock_minimo,
    e.nombre AS empresa,
    p.estado
FROM productos p
JOIN categorias c ON p.id_categoria = c.id_categoria
JOIN empresa e ON p.id_empresa = e.id_empresa;

SELECT 
    m.id_movimiento, 
    p.nombre AS producto, 
    u.nombre AS usuario_responsable, 
    m.tipo_movimiento, 
    m.motivo, 
    m.cantidad, 
    m.observacion
FROM movimientos_inventario m
JOIN productos p ON m.id_producto = p.id_producto
JOIN usuario u ON m.id_usuario = u.id_usuario;

SELECT 
    a.id_auditoria, 
    u.nombre AS usuario, 
    a.tabla_afectada, 
    a.accion, 
    a.registro_id, 
    a.descripcion, 
    a.fecha
FROM auditoria a
JOIN usuario u ON a.id_usuario = u.id_usuario;

SELECT * FROM tokens_blacklist;

SELECT * FROM codigos_recuperacion;