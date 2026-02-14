import { useState, useEffect } from 'react';
import { Table, Alert, Modal, Card, Input, Button } from '../../components/ui';
import type { Column } from '../../components/ui';
import { invoicesService } from '../../services';
import type { Invoice, InvoiceWithDetails, SaleItem } from '../../interfaces';

export function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setIsLoading(true);
      const data = await invoicesService.getAll();
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
      setError('Error al cargar los detalles');
      console.error(err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: Column<Invoice>[] = [
    { key: 'invoice_number', header: 'Número', className: 'w-36' },
    { key: 'customer_name', header: 'Cliente' },
    { key: 'customer_email', header: 'Email' },
    {
      key: 'total',
      header: 'Total',
      render: (inv) => (
        <span className="font-medium text-sky-600">{formatCurrency(inv.total)}</span>
      ),
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Facturas</h1>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <div className="max-w-md">
        <Input
          placeholder="Buscar por número, cliente o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Table
        data={filteredInvoices}
        columns={columns}
        keyExtractor={(inv) => inv.id}
        isLoading={isLoading}
        emptyMessage="No hay facturas registradas"
      />

      {/* Modal detalle de factura */}
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
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <p className="text-sm text-slate-500">Cliente</p>
                  <p className="font-medium">{selectedInvoice.customer_name}</p>
                  <p className="text-sm text-slate-500">{selectedInvoice.customer_email}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-slate-500">Total</p>
                  <p className="text-2xl font-bold text-sky-600">
                    {formatCurrency(selectedInvoice.total)}
                  </p>
                  <p className="text-sm text-slate-500">
                    {new Date(selectedInvoice.created_at).toLocaleDateString('es-ES')}
                  </p>
                </Card>
              </div>

              <div>
                <h4 className="font-medium mb-2">Productos</h4>
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
