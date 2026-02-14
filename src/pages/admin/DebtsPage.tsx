import { useState, useEffect } from 'react';
import { Table, Alert, Badge, Modal, Card, Input, Button, Select } from '../../components/ui';
import type { Column } from '../../components/ui';
import { debtsService, usersService } from '../../services';
import type { Debt, DebtInsert, User } from '../../interfaces';
import { useAuth } from '../../context';

export function DebtsPage() {
  const { profile } = useAuth();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOnlyPending, setShowOnlyPending] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '',
    concept: '',
    amount: '',
  });

  useEffect(() => {
    loadData();
  }, [showOnlyPending]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [debtsData, customersData] = await Promise.all([
        showOnlyPending ? debtsService.getPending() : debtsService.getAll(),
        usersService.getCustomers(),
      ]);
      setDebts(debtsData);
      setCustomers(customersData);
      setError(null);
    } catch (err) {
      setError('Error al cargar las deudas');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = () => {
    setFormData({ customer_id: '', concept: '', amount: '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_id || !formData.concept || !formData.amount) return;

    try {
      setIsSaving(true);
      const amount = parseFloat(formData.amount);
      const debtData: DebtInsert = {
        customer_id: formData.customer_id,
        concept: formData.concept,
        amount,
        remaining: amount,
        type: 'external',
        created_by: profile?.id || '',
      };
      await debtsService.create(debtData);
      await loadData();
      setIsModalOpen(false);
    } catch (err) {
      setError('Error al crear la deuda');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getTotalDebt = () => {
    return debts.reduce((sum, debt) => sum + debt.remaining, 0);
  };

  const columns: Column<Debt>[] = [
    { key: 'id', header: 'ID', className: 'w-16' },
    {
      key: 'customer',
      header: 'Cliente',
      render: (d) => d.customer?.name || 'Sin cliente',
    },
    { key: 'concept', header: 'Concepto' },
    {
      key: 'type',
      header: 'Tipo',
      render: (d) => (
        <Badge variant={d.type === 'sale' ? 'info' : 'default'}>
          {d.type === 'sale' ? 'Venta' : 'Externa'}
        </Badge>
      ),
    },
    {
      key: 'amount',
      header: 'Monto Original',
      render: (d) => formatCurrency(d.amount),
    },
    {
      key: 'remaining',
      header: 'Pendiente',
      render: (d) => (
        <span className={d.remaining > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
          {formatCurrency(d.remaining)}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Fecha',
      render: (d) => new Date(d.created_at).toLocaleDateString('es-ES'),
    },
  ];

  const customerOptions = customers.map((c) => ({ value: c.id, label: `${c.name} (${c.email})` }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Deudas</h1>
        <Button onClick={handleOpenModal}>+ Nueva Deuda</Button>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-slate-500">Total Pendiente</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(getTotalDebt())}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-500">Cantidad de Deudas</p>
          <p className="text-2xl font-bold text-slate-800">{debts.length}</p>
        </Card>
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
      </div>

      <Table
        data={debts}
        columns={columns}
        keyExtractor={(d) => d.id}
        isLoading={isLoading}
        emptyMessage="No hay deudas registradas"
      />

      {/* Modal nueva deuda */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nueva Deuda Externa"
        size="md"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Select
            label="Cliente"
            options={customerOptions}
            value={formData.customer_id}
            onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
            placeholder="Seleccionar cliente"
            required
          />
          <Input
            label="Concepto"
            value={formData.concept}
            onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
            placeholder="Descripción de la deuda"
            required
          />
          <Input
            label="Monto"
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="0.00"
            required
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSaving}>
              Crear Deuda
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
