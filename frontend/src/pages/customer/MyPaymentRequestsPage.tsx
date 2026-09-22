import { useState, useEffect } from 'react';
import { Card, Table, Alert, Badge, Button, Modal, Input } from '../../components/ui';
import type { Column } from '../../components/ui';
import { paymentRequestsService, debtsService } from '../../services';
import { useAuth } from '../../context';
import type { PaymentRequest } from '../../interfaces';

export function MyPaymentRequestsPage() {
  const { profile } = useAuth();
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [totalDebt, setTotalDebt] = useState(0);
  const [formData, setFormData] = useState({
    amount: '',
    notes: '',
  });

  useEffect(() => {
    if (profile) {
      loadData();
    }
  }, [profile]);

  const loadData = async () => {
    if (!profile) return;
    try {
      setIsLoading(true);
      const [requestsData, debtsData] = await Promise.all([
        paymentRequestsService.getByCustomer(profile.id),
        debtsService.getByCustomer(profile.id),
      ]);
      setRequests(requestsData);
      setTotalDebt(debtsData.reduce((sum, d) => sum + d.remaining, 0));
      setError(null);
    } catch (err) {
      setError('Error al cargar las solicitudes');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = () => {
    setFormData({ amount: '', notes: '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !formData.amount) return;

    const amount = parseFloat(formData.amount);
    if (amount <= 0) {
      setError('El monto debe ser mayor a 0');
      return;
    }
    if (amount > totalDebt) {
      setError('El monto no puede ser mayor a tu deuda total');
      return;
    }

    try {
      setIsSaving(true);
      await paymentRequestsService.create({
        customer_id: profile.id,
        amount,
        notes: formData.notes || undefined,
      });
      await loadData();
      setIsModalOpen(false);
    } catch (err) {
      setError('Error al crear la solicitud');
      console.error(err);
    } finally {
      setIsSaving(false);
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
    { key: 'id', header: 'N°', className: 'w-16' },
    {
      key: 'amount',
      header: 'Monto',
      render: (r) => <span className="font-medium text-sky-600">{formatCurrency(r.amount)}</span>,
    },
    {
      key: 'notes',
      header: 'Notas',
      render: (r) => r.notes || '-',
    },
    {
      key: 'status',
      header: 'Estado',
      render: (r) => getStatusBadge(r.status),
    },
    {
      key: 'admin_notes',
      header: 'Respuesta',
      render: (r) => r.admin_notes || '-',
    },
    {
      key: 'created_at',
      header: 'Fecha',
      render: (r) => new Date(r.created_at).toLocaleDateString('es-ES'),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Mis Solicitudes de Abono</h1>
        {totalDebt > 0 && (
          <Button onClick={handleOpenModal}>+ Nueva Solicitud</Button>
        )}
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Info de deuda */}
      <Card className="p-4">
        <p className="text-sm text-slate-500">Tu deuda pendiente actual</p>
        <p className="text-2xl font-bold text-red-600">{formatCurrency(totalDebt)}</p>
      </Card>

      <Table
        data={requests}
        columns={columns}
        keyExtractor={(r) => r.id}
        isLoading={isLoading}
        emptyMessage="No tienes solicitudes de abono"
      />

      {/* Modal nueva solicitud */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nueva Solicitud de Abono"
        size="md"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Card className="p-4 bg-sky-50">
            <p className="text-sm text-slate-600">Deuda pendiente: <strong className="text-red-600">{formatCurrency(totalDebt)}</strong></p>
          </Card>
          <Input
            label="Monto a abonar"
            type="number"
            step="0.01"
            min="0.01"
            max={totalDebt}
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="0.00"
            required
          />
          <Input
            label="Notas (opcional)"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Información adicional sobre el pago..."
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSaving}>
              Enviar Solicitud
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
