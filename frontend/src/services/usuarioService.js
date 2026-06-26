import API from "./api";

export const getUsuarios = async (idEmpresa) => {
  const response = await API.get(`/usuarios?id_empresa=${idEmpresa}`);

  return response.data;
};

export const crearUsuario = async (datos) => {
  const response = await API.post("/usuarios", datos);
  return response.data;
};

export const cambiarEstadoUsuario = async (id, estado) => {
  const response = await API.put(`/usuarios/estado/${id}`, {
    estado,
  });

  return response.data;
};