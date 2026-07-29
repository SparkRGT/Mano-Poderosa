import axios from "axios";
import type { IProducto } from "./interfaces/productos";
import type { IVenta } from "./interfaces/ventas";

const API = "http://localhost:4000";

// Productos
export const getProductos = async () => {
  const res = await axios.get<IProducto[]>(`${API}/productos`);
  return res.data;
};

export const createProducto = async (data: Omit<IProducto, "id_producto">) => {
  const res = await axios.post<IProducto>(`${API}/productos`, data);
  return res.data;
};

// Ventas
export const getVentas = async () => {
  const res = await axios.get<IVenta[]>(`${API}/ventas`);
  return res.data;
};

export const createVenta = async (data: { id_producto: number; cantidad: number }) => {
  const res = await axios.post<IVenta>(`${API}/ventas`, data);
  return res.data;
};
