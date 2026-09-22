import { useEffect, useState } from "react";
import { supabase } from "../supabase";

interface Producto {
  id_producto: number;
  codigo: string;
  nombre: string;
  precio: number;
  stock: number;
}

export default function ProductosList() {
  const [productos, setProductos] = useState<Producto[]>([]);

  const fetchProductos = async () => {
    const { data, error } = await supabase.from("productos").select("*");
    if (error) console.error(error);
    else setProductos(data || []);
  };

  useEffect(() => {
    fetchProductos();

    // Suscribirse a cambios en la tabla productos
    const channel = supabase
      .channel("productos-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "productos" },
        (payload) => {
          console.log("Cambio detectado:", payload);
          fetchProductos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2">Lista de Productos</h2>
      <table className="border w-full">
        <thead>
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Código</th>
            <th className="border p-2">Nombre</th>
            <th className="border p-2">Precio</th>
            <th className="border p-2">Stock</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p) => (
            <tr key={p.id_producto}>
              <td className="border p-2">{p.id_producto}</td>
              <td className="border p-2">{p.codigo}</td>
              <td className="border p-2">{p.nombre}</td>
              <td className="border p-2">${p.precio.toFixed(2)}</td>
              <td className="border p-2">{p.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
