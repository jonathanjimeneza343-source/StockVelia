import API from "./api";

export const obtenerProductos = async () => {
  const response = await API.get("/productos");
  return response.data;
};

export const crearProducto = async (datos) => {
  const response = await API.post("/productos", datos);
  return response.data;
};

export const actualizarProducto = async (id, datos) => {
  const response = await API.put(`/productos/${id}`, datos);
  return response.data;
};

export const eliminarProducto = async (id) => {
  const response = await API.delete(`/productos/${id}`);
  return response.data;
};