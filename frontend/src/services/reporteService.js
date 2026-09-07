import API from "./api"; 

export const obtenerReporteInventario = async (idEmpresa) => {
  const response = await API.get(`/reportes/inventario/${idEmpresa}`);
  return response.data;
};

export const obtenerReporteMovimientos = async (idEmpresa) => {
  const response = await API.get(`/reportes/movimientos/${idEmpresa}`);
  return response.data;
};