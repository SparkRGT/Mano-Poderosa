import { useState, useEffect } from 'react';
import { Table, Alert, Badge, Modal, Button } from '../../components/ui';
import type { Column } from '../../components/ui';
import { salesService } from '../../services';
import { useAuth } from '../../context';
import type { Sale, SaleItem } from '../../interfaces';

export function MyPurchasesPage() {
  const { profile } = useAuth();
  const [purchases, setPurchases] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPurchase, setSelectedPurchase] = useState<Sale | null>(null);
  const [items, setItems] = useState<SaleItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  useEffect(() => {
    if (profile) {
      loadPurchases();
    }
  }, [profile]);

  const loadPurchases = async () => {
    if (!profile) return;
    try {
      setIsLoading(true);
      const data = await salesService.getByCustomer(profile.id);
      setPurchases(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar las compras');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = async (purchase: Sale) => {
    setSelectedPurchase(purchase);
    try {
      setIsLoadingItems(true);
      const itemsData = await salesService.getItems(purchase.id);
      setItems(itemsData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingItems(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const columns: Column<Sale>[] = [
    { key: 'id', header: 'N°', className: 'w-16' },
    {
      key: 'total',
      header: 'Total',
      render: (p) => <span className="font-medium">{formatCurrency(p.total)}</span>,
    },
    {
      key: 'status',
      header: 'Estado',
      render: (p) => (
        <Badge variant={p.status === 'paid' ? 'success' : 'warning'}>
          {p.status === 'paid' ? 'Pagada' : 'Pendiente'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'Fecha',
      render: (p) => new Date(p.created_at).toLocaleDateString('es-ES'),
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'w-32',
      render: (p) => (
        <Button size="sm" variant="ghost" onClick={() => handleViewDetails(p)}>
          Ver Detalle
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Mis Compras</h1>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Table
        data={purchases}
        columns={columns}
        keyExtractor={(p) => p.id}
        isLoading={isLoading}
        emptyMessage="No tienes compras registradas"
      />

      {/* Modal detalle */}
      <Modal
        isOpen={!!selectedPurchase}
        onClose={() => setSelectedPurchase(null)}
        title={`Compra #${selectedPurchase?.id}`}
        size="lg"
      >
        <div className="p-6">
          {selectedPurchase && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-slate-500">Fecha</p>
                  <p className="font-medium">
                    {new Date(selectedPurchase.created_at).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Total</p>
                  <p className="text-2xl font-bold text-sky-600">
                    {formatCurrency(selectedPurchase.total)}
                  </p>
                </div>
              </div>

              <Badge variant={selectedPurchase.status === 'paid' ? 'success' : 'warning'}>
                {selectedPurchase.status === 'paid' ? 'Pagada' : 'Pendiente de pago'}
              </Badge>

              <div>
                <h4 className="font-medium mb-2">Productos</h4>
                {isLoadingItems ? (
                  <p className="text-slate-500">Cargando...</p>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-sky-100">
                      <thead className="bg-sky-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-600">Producto</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-slate-600">Cantidad</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-slate-600">Precio</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-slate-600">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-sky-100">
                        {items.map((item) => (
                          <tr key={item.id}>
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
            </div>
          )}
          <div className="flex justify-end mt-6">
            <Button variant="ghost" onClick={() => setSelectedPurchase(null)}>
              Cerrar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
