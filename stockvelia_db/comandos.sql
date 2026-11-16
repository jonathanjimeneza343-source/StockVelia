INSERT INTO roles (id_rol, nombre)
VALUES 
(1, 'ADMINISTRADOR'),
(2, 'EMPLEADO')

TRUNCATE TABLE 
    auditoria, 
    categorias, 
    codigos_recuperacion, 
    empresa, 
    movimientos_inventario, 
    permisos, 
    productos, 
    roles, 
    roles_permisos, 
    tokens_blacklist, 
    usuario, 
    usuario_empresa 
RESTART IDENTITY CASCADE;