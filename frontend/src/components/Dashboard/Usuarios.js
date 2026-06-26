import React, { useEffect, useState } from "react";
import { getUsuarios, crearUsuario, cambiarEstadoUsuario } from "../../services/usuarioService";
import "../../styles/Usuarios.css";

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const usuario = JSON.parse(localStorage.getItem("usuario"));

      const data = await getUsuarios(usuario.id_empresa);

      setUsuarios(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCrear = async (e) => {
    e.preventDefault();

    try {
      const usuarioLogueado = JSON.parse(localStorage.getItem("usuario"));

      await crearUsuario({
        nombre,
        correo,
        password,
        id_empresa: usuarioLogueado.id_empresa,
      });

      setNombre("");
      setCorreo("");
      setPassword("");

      cargarUsuarios();

      alert("Empleado creado");
    } catch (error) {
      alert(error.response?.data?.error || "Error al crear usuario");
    }
  };

  const handleCambiarEstado = async (usuario) => {
    const mensaje = usuario.estado
      ? "¿Deseas desactivar este usuario?"
      : "¿Deseas activar este usuario?";

    if (!window.confirm(mensaje)) return;

    try {
      await cambiarEstadoUsuario(
        usuario.id_usuario,
        !usuario.estado
      );

      cargarUsuarios();

      alert(
        usuario.estado
          ? "Usuario desactivado correctamente."
          : "Usuario activado correctamente."
      );

    } catch (error) {
      console.error(error);
      alert("No se pudo cambiar el estado.");
    }
  };

  return (
    <div className="usuarios-container">
      <h2>Gestión de Usuarios</h2>

      <form className="usuarios-form" onSubmit={handleCrear}>
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <input
          type="email"
          placeholder="Correo"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Crear empleado</button>
      </form>

      <table className="tabla-usuarios">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id_usuario}>
              <td>{u.nombre}</td>

              <td>{u.correo}</td>

              <td>
                {u.id_rol === 1
                  ? "Administrador"
                  : "Empleado"}
              </td>

              <td>
                <span
                  className={
                    u.estado
                      ? "estado-activo"
                      : "estado-inactivo"
                  }
                >
                  {u.estado ? "Activo" : "Inactivo"}
                </span>
              </td>

              <td>
                {u.id_rol !== 1 && (
                  <button
                    className={
                      u.estado
                        ? "btn-desactivar"
                        : "btn-activar"
                    }
                    onClick={() => handleCambiarEstado(u)}
                  >
                    {u.estado
                      ? "Desactivar"
                      : "Activar"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Usuarios;
