import ProductosForm from "./components/ProductoForm";
import VentasForm from "./components/VentaForm";
import ProductosList from "./components/ProductoList";
import ExportExcel from "./components/ExportExcel";

function App() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 p-6">
      <h1 className="text-2xl font-bold">Gestión de Productos y Ventas</h1>
      <ProductosForm />
      <VentasForm />
      <ProductosList />
      <ExportExcel />
    </div>
  );
}

export default App;
