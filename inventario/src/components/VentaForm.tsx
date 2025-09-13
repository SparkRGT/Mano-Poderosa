import { useEffect, useState } from "react";
import { supabase } from "../supabase";

interface Producto {
  id_producto: number;
  nombre: string;
  stock: number;
}

export default function VentasForm() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState<number | null>(null);
  const [cantidad, setCantidad] = useState<number>(1);

  // Cargar lista de productos
  const fetchProductos = async () => {
    const { data, error } = await supabase.from("productos").select("id_producto, nombre, stock");
    if (error) console.error(error);
    else setProductos(data || []);
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productoSeleccionado) {
      alert("⚠️ Selecciona un producto");
      return;
    }

    const { error } = await supabase.from("ventas").insert([
      { id_producto: productoSeleccionado, cantidad }
    ]);

    if (error) {
      console.error(error);
      alert("❌ Error al registrar venta");
    } else {
      alert("✅ Venta registrada!");
      setProductoSeleccionado(null);
      setCantidad(1);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 p-4 border rounded">
      <h2 className="text-lg font-bold">Registrar Venta</h2>

      <select
        value={productoSeleccionado ?? ""}
        onChange={(e) => setProductoSeleccionado(parseInt(e.target.value))}
        className="border p-2 w-full"
      >
        <option value="">-- Selecciona un producto --</option>
        {productos.map((p) => (
          <option key={p.id_producto} value={p.id_producto}>
            {p.nombre} (Stock: {p.stock})
          </option>
        ))}
      </select>

      <input
        type="number"
        value={cantidad}
        min={1}
        onChange={(e) => setCantidad(parseInt(e.target.value))}
        placeholder="Cantidad"
        className="border p-2 w-full"
      />

      <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
        Vender
      </button>
    </form>
  );
}
