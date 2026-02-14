import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Table, Alert, Badge, Modal, Card } from '../../components/ui';
import type { Column } from '../../components/ui';
import { salesService } from '../../services';
import type { SaleWithCustomer, SaleItem } from '../../interfaces';
import { ROUTES } from '../../config/constants';

export function SalesPage() {
  const navigate = useNavigate();
  const [sales, setSales] = useState<SaleWithCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSale, setSelectedSale] = useState<SaleWithCustomer | null>(null);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      setIsLoading(true);
      const data = await salesService.getAll();
      setSales(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar las ventas');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = async (sale: SaleWithCustomer) => {
    setSelectedSale(sale);
    try {
      setIsLoadingItems(true);
      const items = await salesService.getItems(sale.id);
      setSaleItems(items);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingItems(false);
    }
  };

  const handleUpdateStatus = async (sale: SaleWithCustomer) => {
    try {
      const newStatus = sale.status === 'paid' ? 'pending' : 'paid';
      await salesService.updateStatus(sale.id, newStatus);
      await loadSales();
    } catch (err) {
      setError('Error al actualizar el estado');
      console.error(err);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const columns: Column<SaleWithCustomer>[] = [
    { key: 'id', header: 'ID', className: 'w-16' },
    {
      key: 'invoice_number',
      header: 'Factura',
      render: (s) => s.invoice_number || '-',
    },
    {
      key: 'customer',
      header: 'Cliente',
      render: (s) => s.customer?.name || 'Sin cliente',
    },
    {
      key: 'total',
      header: 'Total',
      render: (s) => formatCurrency(s.total),
    },
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
    {
      key: 'actions',
      header: 'Acciones',
      className: 'w-52',
      render: (s) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => handleViewDetails(s)}>
            Ver Detalle
          </Button>
          <Button
            size="sm"
            variant={s.status === 'paid' ? 'secondary' : 'primary'}
            onClick={() => handleUpdateStatus(s)}
          >
            {s.status === 'paid' ? 'Marcar Pendiente' : 'Marcar Pagada'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Ventas</h1>
        <Button onClick={() => navigate(ROUTES.ADMIN_NEW_SALE)}>+ Nueva Venta</Button>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Table
        data={sales}
        columns={columns}
        keyExtractor={(s) => s.id}
        isLoading={isLoading}
        emptyMessage="No hay ventas registradas"
      />

      {/* Modal detalle de venta */}
      <Modal
        isOpen={!!selectedSale}
        onClose={() => setSelectedSale(null)}
        title={`Venta #${selectedSale?.id}`}
        size="lg"
      >
        <div className="p-6">
          {selectedSale && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <p className="text-sm text-slate-500">Cliente</p>
                  <p className="font-medium">{selectedSale.customer?.name}</p>
                  <p className="text-sm text-slate-500">{selectedSale.customer?.email}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-slate-500">Total</p>
                  <p className="text-2xl font-bold text-sky-600">
                    {formatCurrency(selectedSale.total)}
                  </p>
                  <Badge variant={selectedSale.status === 'paid' ? 'success' : 'warning'}>
                    {selectedSale.status === 'paid' ? 'Pagada' : 'Pendiente'}
                  </Badge>
                </Card>
              </div>

              <div>
                <h4 className="font-medium mb-2">Productos</h4>
                {isLoadingItems ? (
                  <p className="text-slate-500">Cargando...</p>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-sky-100">
                      <thead className="bg-sky-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-600">Código</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-600">Producto</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-slate-600">Cantidad</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-slate-600">Precio Unit.</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-slate-600">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-sky-100">
                        {saleItems.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-2 text-sm">{item.product_code}</td>
                            <td className="px-4 py-2 text-sm">{item.product_name}</td>
                            <td className="px-4 py-2 text-sm text-right">{item.quantity}</td>
                            <td className="px-4 py-2 text-sm text-right">{formatCurrency(item.unit_price)}</td>
                            <td className="px-4 py-2 text-sm text-right font-medium">{formatCurrency(item.subtotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {selectedSale.notes && (
                <div>
                  <p className="text-sm text-slate-500">Notas</p>
                  <p className="text-slate-700">{selectedSale.notes}</p>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end mt-6">
            <Button variant="ghost" onClick={() => setSelectedSale(null)}>
              Cerrar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
