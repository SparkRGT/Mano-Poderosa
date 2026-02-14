import { useState, useEffect } from 'react';
import { Table, Alert, Modal, Button } from '../../components/ui';
import type { Column } from '../../components/ui';
import { invoicesService } from '../../services';
import { useAuth } from '../../context';
import type { Invoice, InvoiceWithDetails, SaleItem } from '../../interfaces';

export function MyInvoicesPage() {
  const { profile } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    if (profile) {
      loadInvoices();
    }
  }, [profile]);

  const loadInvoices = async () => {
    if (!profile) return;
    try {
      setIsLoading(true);
      const data = await invoicesService.getByCustomer(profile.id);
      setInvoices(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar las facturas');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = async (invoice: Invoice) => {
    try {
      setIsLoadingDetails(true);
      const details = await invoicesService.getById(invoice.id);
      setSelectedInvoice(details);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const columns: Column<Invoice>[] = [
    { key: 'invoice_number', header: 'Número' },
    {
      key: 'total',
      header: 'Total',
      render: (inv) => <span className="font-medium text-sky-600">{formatCurrency(inv.total)}</span>,
    },
    {
      key: 'created_at',
      header: 'Fecha',
      render: (inv) => new Date(inv.created_at).toLocaleDateString('es-ES'),
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'w-32',
      render: (inv) => (
        <Button size="sm" variant="ghost" onClick={() => handleViewDetails(inv)}>
          Ver Detalle
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Mis Facturas</h1>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Table
        data={invoices}
        columns={columns}
        keyExtractor={(inv) => inv.id}
        isLoading={isLoading}
        emptyMessage="No tienes facturas registradas"
      />

      {/* Modal detalle */}
      <Modal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        title={`Factura ${selectedInvoice?.invoice_number}`}
        size="lg"
      >
        <div className="p-6">
          {isLoadingDetails ? (
            <div className="text-center py-8">Cargando...</div>
          ) : selectedInvoice ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-slate-500">Fecha de emisión</p>
                  <p className="font-medium">
                    {new Date(selectedInvoice.created_at).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Total</p>
                  <p className="text-2xl font-bold text-sky-600">
                    {formatCurrency(selectedInvoice.total)}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Detalle</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-sky-100">
                    <thead className="bg-sky-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-600">Código</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-600">Producto</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-slate-600">Cant.</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-slate-600">Precio</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-slate-600">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sky-100">
                      {selectedInvoice.sale?.items?.map((item: SaleItem) => (
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
              </div>
            </div>
          ) : null}
          <div className="flex justify-end mt-6">
            <Button variant="ghost" onClick={() => setSelectedInvoice(null)}>
              Cerrar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
