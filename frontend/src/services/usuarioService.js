import API from "./api";

export const getUsuarios = async (idEmpresa) => {
  const response = await API.get(`/usuarios?id_empresa=${idEmpresa}`);

  return response.data;
};

export const crearUsuario = async (datos) => {
  const response = await API.post("/usuarios", datos);
  return response.data;
};
