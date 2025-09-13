export interface IVenta {
  id_venta: number;
  nombre: string; // nombre del producto
  cantidad: number;
  fecha: string;  // en ISO string, luego convertimos en Date
}
