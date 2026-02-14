import { useState, useEffect } from 'react';
import { Card, Alert, Input, Button, Table, Badge } from '../../components/ui';
import type { Column } from '../../components/ui';
import { salesService, productsService } from '../../services';
import type { SaleWithCustomer, ProductWithCategory } from '../../interfaces';

export function ReportsPage() {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [sales, setSales] = useState<SaleWithCustomer[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<ProductWithCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sales' | 'inventory'>('sales');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [salesData, lowStock] = await Promise.all([
        salesService.getByDateRange(startDate, endDate + 'T23:59:59'),
        productsService.getLowStock(),
      ]);
      setSales(salesData);
      setLowStockProducts(lowStock);
      setError(null);
    } catch (err) {
      setError('Error al cargar los reportes');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterSales = async () => {
    try {
      setIsLoading(true);
      const data = await salesService.getByDateRange(startDate, endDate + 'T23:59:59');
      setSales(data);
      setError(null);
    } catch (err) {
      setError('Error al filtrar ventas');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getTotalSales = () => sales.reduce((sum, s) => sum + s.total, 0);
  const getPaidSales = () => sales.filter((s) => s.status === 'paid').reduce((sum, s) => sum + s.total, 0);
  const getPendingSales = () => sales.filter((s) => s.status === 'pending').reduce((sum, s) => sum + s.total, 0);

  const salesColumns: Column<SaleWithCustomer>[] = [
    { key: 'id', header: 'ID', className: 'w-16' },
    { key: 'invoice_number', header: 'Factura', render: (s) => s.invoice_number || '-' },
    { key: 'customer', header: 'Cliente', render: (s) => s.customer?.name || '-' },
    { key: 'total', header: 'Total', render: (s) => formatCurrency(s.total) },
    {
      key: 'status',
      header: 'Estado',
      render: (s) => (
        <Badge variant={s.status === 'paid' ? 'success' : 'warning'}>
          {s.status === 'paid' ? 'Pagada' : 'Pendiente'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'Fecha',
      render: (s) => new Date(s.created_at).toLocaleDateString('es-ES'),
    },
  ];

  const stockColumns: Column<ProductWithCategory>[] = [
    { key: 'product_code', header: 'Código' },
    { key: 'name', header: 'Producto' },
    { key: 'category', header: 'Categoría', render: (p) => p.category?.name || '-' },
    {
      key: 'stock',
      header: 'Stock',
      render: (p) => (
        <Badge variant={p.stock === 0 ? 'error' : 'warning'}>
          {p.stock} unidades
        </Badge>
      ),
    },
    { key: 'price', header: 'Precio', render: (p) => formatCurrency(p.price) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Reportes</h1>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-sky-100">
        <button
          onClick={() => setActiveTab('sales')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'sales'
              ? 'border-sky-500 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-sky-600'
          }`}
        >
          Reporte de Ventas
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'inventory'
              ? 'border-sky-500 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-sky-600'
          }`}
        >
          Stock Bajo
        </button>
      </div>

      {activeTab === 'sales' && (
        <>
          {/* Filtros */}
          <Card className="p-4">
            <div className="flex flex-wrap items-end gap-4">
              <Input
                label="Fecha Inicio"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Input
                label="Fecha Fin"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <Button onClick={handleFilterSales}>Filtrar</Button>
            </div>
          </Card>

          {/* Resumen */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <p className="text-sm text-slate-500">Total Ventas</p>
              <p className="text-2xl font-bold text-slate-800">{sales.length}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-slate-500">Monto Total</p>
              <p className="text-2xl font-bold text-sky-600">{formatCurrency(getTotalSales())}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-slate-500">Pagadas</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(getPaidSales())}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-slate-500">Pendientes</p>
              <p className="text-2xl font-bold text-amber-600">{formatCurrency(getPendingSales())}</p>
            </Card>
          </div>

          <Table
            data={sales}
            columns={salesColumns}
            keyExtractor={(s) => s.id}
            isLoading={isLoading}
            emptyMessage="No hay ventas en el período seleccionado"
          />
        </>
      )}

      {activeTab === 'inventory' && (
        <>
          <Card className="p-4">
            <p className="text-slate-600">
              Productos con stock menor o igual a 10 unidades
            </p>
          </Card>
          <Table
            data={lowStockProducts}
            columns={stockColumns}
            keyExtractor={(p) => p.id}
            isLoading={isLoading}
            emptyMessage="No hay productos con stock bajo"
          />
        </>
      )}
    </div>
  );
}
