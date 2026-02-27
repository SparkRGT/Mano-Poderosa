import { useState, useEffect } from 'react';
import { Table, Alert, Badge, Modal, Card, Input, Button } from '../../components/ui';
import type { Column } from '../../components/ui';
import { paymentRequestsService } from '../../services';
import type { PaymentRequest } from '../../interfaces';
import { useAuth } from '../../context';

export function PaymentRequestsPage() {
  const { profile } = useAuth();
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOnlyPending, setShowOnlyPending] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadRequests();
  }, [showOnlyPending]);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      const data = showOnlyPending
        ? await paymentRequestsService.getPending()
        : await paymentRequestsService.getAll();
      setRequests(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar las solicitudes');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenReview = (request: PaymentRequest) => {
    setSelectedRequest(request);
    setAdminNotes('');
  };

  const handleProcess = async (approve: boolean) => {
    if (!selectedRequest || !profile) return;

    try {
      setIsProcessing(true);
      if (approve) {
        await paymentRequestsService.approve(selectedRequest.id, profile.id, adminNotes || undefined);
      } else {
        await paymentRequestsService.reject(selectedRequest.id, profile.id, adminNotes || undefined);
      }
      await loadRequests();
      setSelectedRequest(null);
    } catch (err) {
      setError('Error al procesar la solicitud');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pendiente</Badge>;
      case 'approved':
        return <Badge variant="success">Aprobada</Badge>;
      case 'rejected':
        return <Badge variant="error">Rechazada</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const columns: Column<PaymentRequest>[] = [
    { key: 'id', header: 'ID', className: 'w-16' },
    {
      key: 'customer',
      header: 'Cliente',
      render: (r) => (
        <div>
          <p className="font-medium">{r.customer?.name}</p>
          <p className="text-sm text-slate-500">{r.customer?.email}</p>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Monto',
      render: (r) => <span className="font-medium text-sky-600">{formatCurrency(r.amount)}</span>,
    },
    {
      key: 'notes',
      header: 'Notas del Cliente',
      render: (r) => r.notes || '-',
    },
    {
      key: 'status',
      header: 'Estado',
      render: (r) => getStatusBadge(r.status),
    },
    {
      key: 'created_at',
      header: 'Fecha',
      render: (r) => new Date(r.created_at).toLocaleDateString('es-ES'),
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'w-32',
      render: (r) =>
        r.status === 'pending' ? (
          <Button size="sm" variant="primary" onClick={() => handleOpenReview(r)}>
            Revisar
          </Button>
        ) : (
          <span className="text-sm text-slate-500">Procesada</span>
        ),
    },
  ];

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Solicitudes de Abono</h1>
        {pendingCount > 0 && (
          <Badge variant="warning" className="text-base px-3 py-1">
            {pendingCount} pendiente{pendingCount > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card className="p-4 flex items-center">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showOnlyPending}
            onChange={(e) => setShowOnlyPending(e.target.checked)}
            className="w-4 h-4 text-sky-600 border-sky-300 rounded focus:ring-sky-500"
          />
          <span className="text-sm text-slate-700">Mostrar solo pendientes</span>
        </label>
      </Card>

      <Table
        data={requests}
        columns={columns}
        keyExtractor={(r) => r.id}
        isLoading={isLoading}
        emptyMessage="No hay solicitudes de abono"
      />

      {/* Modal revisar solicitud */}
      <Modal
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        title="Revisar Solicitud de Abono"
        size="md"
      >
        <div className="p-6 space-y-4">
          {selectedRequest && (
            <>
              <Card className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Cliente</p>
                    <p className="font-medium">{selectedRequest.customer?.name}</p>
                    <p className="text-sm text-slate-500">{selectedRequest.customer?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Monto Solicitado</p>
                    <p className="text-2xl font-bold text-sky-600">
                      {formatCurrency(selectedRequest.amount)}
                    </p>
                  </div>
                </div>
                {selectedRequest.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-slate-500">Notas del cliente</p>
                    <p className="text-slate-700">{selectedRequest.notes}</p>
                  </div>
                )}
              </Card>

              <Input
                label="Notas del administrador (opcional)"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Agregar notas..."
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" onClick={() => setSelectedRequest(null)}>
                  Cancelar
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleProcess(false)}
                  isLoading={isProcessing}
                >
                  Rechazar
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleProcess(true)}
                  isLoading={isProcessing}
                >
                  Aprobar Abono
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
