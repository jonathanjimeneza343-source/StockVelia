import API from "./api";

export const getUsuarios = async () => {
  const response = await API.get("/usuarios");
  return response.data;
};

export const crearUsuario = async (datos) => {
  const response = await API.post("/usuarios", datos);
  return response.data;
};

export const actualizarUsuario = async (id, datos) => {
  const response = await API.put(`/usuarios/${id}`, datos);
  return response.data;
};

export const cambiarEstadoUsuario = async (id, estado) => {
  const response = await API.patch(`/usuarios/${id}/estado`, { estado });
  return response.data;
};

export const eliminarUsuarioLogico = async (id) => {
  const response = await API.delete(`/usuarios/${id}`);
  return response.data;
};