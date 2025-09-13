import { supabase } from "../supabase";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function ExportExcel() {
  const exportData = async () => {
    // 1. Traer productos
    const { data: productos, error: errorProd } = await supabase
      .from("productos")
      .select("*");
    if (errorProd) {
      console.error(errorProd);
      alert("Error al obtener productos");
      return;
    }

    // 2. Traer ventas
    const { data: ventas, error: errorVentas } = await supabase
      .from("ventas")
      .select("*");
    if (errorVentas) {
      console.error(errorVentas);
      alert("Error al obtener ventas");
      return;
    }

    // 3. Crear workbook
    const wb = XLSX.utils.book_new();

    // Hoja Productos
    const wsProductos = XLSX.utils.json_to_sheet(productos || []);
    XLSX.utils.book_append_sheet(wb, wsProductos, "Productos");

    // Hoja Ventas
    const wsVentas = XLSX.utils.json_to_sheet(ventas || []);
    XLSX.utils.book_append_sheet(wb, wsVentas, "Ventas");

    // 4. Guardar como Excel
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, "datos_supabase.xlsx");
  };

  return (
    <button
      onClick={exportData}
      className="bg-purple-500 text-white px-4 py-2 rounded"
    >
      Exportar Excel
    </button>
  );
}
