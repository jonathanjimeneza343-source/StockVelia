import API from './api';

export const getUsuarios = async () => {
  const response = await API.get('/usuarios');
  return response.data;
};

export const crearUsuario = async (datos) => {
  const response = await API.post('/usuarios', datos);
  return response.data;
};

export const cambiarEstadoUsuario = async (id) => {
  const response = await API.put(`/usuarios/estado/${id}`);
  return response.data;
};