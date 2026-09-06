import React, { useEffect, useState } from "react";
import {
  getUsuarios,
  crearUsuario,
  cambiarEstadoUsuario,
} from "../../services/usuarioService";
import "../../styles/Usuarios.css";
import Swal from "sweetalert2";

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

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!passwordRegex.test(password)) {
      Swal.fire({
        icon: "warning",
        title: "Contraseña insegura",
        text: "La contraseña debe tener al menos 6 caracteres, una letra mayúscula, una minúscula y un número.",
        confirmButtonColor: "#5e059e",
      });
      return;
    }

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

      Swal.fire({
        icon: "success",
        title: "¡Empleado creado!",
        text: "El nuevo usuario ha sido registrado con éxito.",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#5e059e",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al crear usuario",
        text:
          error.response?.data?.error || "No se pudo registrar el empleado.",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#5e059e",
      });
    }
  };

  const handleCambiarEstado = async (usuario) => {
    const accion = usuario.estado ? "desactivar" : "activar";

    const resultado = await Swal.fire({
      icon: usuario.estado ? "warning" : "question",
      title: `¿Deseas ${accion} este usuario?`,
      text: usuario.estado
        ? "El usuario no podrá iniciar sesión hasta que sea activado nuevamente."
        : "El usuario podrá volver a iniciar sesión en StockVelia.",
      showCancelButton: true,
      confirmButtonText: usuario.estado ? "Sí, desactivar" : "Sí, activar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#6818a5",
      cancelButtonColor: "#d33",
      reverseButtons: true,
      focusCancel: true,
    });

    if (!resultado.isConfirmed) return;

    try {
      await cambiarEstadoUsuario(usuario.id_usuario);

      cargarUsuarios();

      await Swal.fire({
        icon: "success",
        title: usuario.estado ? "Usuario desactivado" : "Usuario activado",
        text: usuario.estado
          ? "El usuario ya no puede iniciar sesión."
          : "El usuario puede volver a iniciar sesión.",
        confirmButtonText: "Aceptar",
      });
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Ocurrió un error",
        text: "No se pudo cambiar el estado del usuario.",
        confirmButtonText: "Entendido",
      });
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
          required
        />

        <input
          type="email"
          placeholder="Correo"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Crear empleado</button>
      </form>

      <div className="table-responsive">
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
                <td>{u.id_rol === 1 ? "Administrador" : "Empleado"}</td>
                <td>{u.estado ? "Activo" : "Inactivo"}</td>

                <td>
                  {u.id_rol !== 1 && (
                    <button
                      className="btn-eliminar"
                      onClick={() => handleCambiarEstado(u)}
                    >
                      {u.estado ? "Desactivar" : "Activar"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Usuarios;
