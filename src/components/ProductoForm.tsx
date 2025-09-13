import { useState } from "react";
import { supabase } from "../supabase";

export default function ProductosForm() {
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("productos").insert([
      { codigo, nombre, precio, stock }
    ]);
    if (error) {
      console.error(error);
      alert("Error al guardar producto");
    } else {
      alert("✅ Producto agregado!");
      setCodigo("");
      setNombre("");
      setPrecio(0);
      setStock(0);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 p-4 border rounded">
      <h2 className="text-lg font-bold">Agregar Producto</h2>
      <input
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
        placeholder="Código de barras"
        className="border p-2 w-full"
      />
      <input
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Nombre"
        className="border p-2 w-full"
      />
      <input
        type="number"
        value={precio}
        onChange={(e) => setPrecio(parseFloat(e.target.value))}
        placeholder="Precio"
        className="border p-2 w-full"
      />
      <input
        type="number"
        value={stock}
        onChange={(e) => setStock(parseInt(e.target.value))}
        placeholder="Stock"
        className="border p-2 w-full"
      />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Guardar
      </button>
    </form>
  );
}
