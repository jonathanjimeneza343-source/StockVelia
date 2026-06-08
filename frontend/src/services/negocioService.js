import API from './api';

// Productos
export const getProductos = async () => (await API.get('/productos')).data;
export const createProducto = async (data) => (await API.post('/productos', data)).data;
export const updateProducto = async (id, data) => (await API.put(`/productos/${id}`, data)).data;
export const deleteProducto = async (id) => (await API.delete(`/productos/${id}`)).data;

// Categorías
export const getCategorias = async () => (await API.get('/categorias')).data;
export const createCategoria = async (data) => (await API.post('/categorias', data)).data;

// Movimientos de Stock
export const getMovimientos = async () => (await API.get('/movimientos')).data;
export const registerMovimiento = async (data) => (await API.post('/movimientos', data)).data;
