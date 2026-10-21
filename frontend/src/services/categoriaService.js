import API from "./api";

export const obtenerCategorias = async (idEmpresa) => {
  const response = await API.get(`/categorias?id_empresa=${idEmpresa}`);
  return response.data;
};

export const crearCategoria = async (categoriaData) => {
  const response = await API.post("/categorias", categoriaData);
  return response.data;
};

export const actualizarCategoria = async (id_categoria, categoriaData) => {
  const response = await API.put(`/categorias/${id_categoria}`, categoriaData);
  return response.data;
};

export const eliminarCategoria = async (id_categoria) => {
  const response = await API.delete(`/categorias/${id_categoria}`);
  return response.data;
};