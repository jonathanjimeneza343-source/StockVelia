INSERT INTO
    roles (id_rol, nombre)
VALUES
    (1, 'Propietario'),
    (2, 'Administrador Operativo'),
    (3, 'Empleado') ON CONFLICT (id_rol) DO NOTHING;

SELECT
    setval(
        pg_get_serial_sequence('public.roles', 'id_rol'),
        COALESCE(
            (
                SELECT
                    MAX(id_rol)
                FROM
                    public.roles
            ),
            1
        )
    );

TRUNCATE TABLE auditoria,
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
usuario_empresa RESTART IDENTITY CASCADE;