import API from "./api";
export {
  obtenerProductos as getProductos,
  crearProducto as createProducto,
  actualizarProducto as updateProducto,
  eliminarProducto as deleteProducto,
} from "./productoService";
export {
  obtenerCategorias as getCategorias,
  crearCategoria as createCategoria,
} from "./categoriaService";

export const getMovimientos = async () => {
  const response = await API.get("/movimientos");
  return response.data;
};

export const registerMovimiento = async (data) => {
  const response = await API.post("/movimientos", data);
  return response.data;
};