import type { IVenta } from "../interfaces/ventas";

interface VentasListProps {
  ventas: IVenta[];
}

export default function VentasList({ ventas }: VentasListProps) {
  return (
    <table border={1}>
      <thead>
        <tr>
          <th>ID Venta</th>
          <th>Producto</th>
          <th>Cantidad</th>
          <th>Fecha</th>
        </tr>
      </thead>
      <tbody>
        {ventas.map((v) => (
          <tr key={v.id_venta}>
            <td>{v.id_venta}</td>
            <td>{v.nombre}</td>
            <td>{v.cantidad}</td>
            <td>{new Date(v.fecha).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
