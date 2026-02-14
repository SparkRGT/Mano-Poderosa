import { useState, useEffect } from 'react';
import { Card, Table, Alert, Badge, Button } from '../../components/ui';
import type { Column } from '../../components/ui';
import { debtsService } from '../../services';
import { useAuth } from '../../context';
import type { Debt } from '../../interfaces';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../config/constants';

export function MyDebtPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      loadDebts();
    }
  }, [profile]);

  const loadDebts = async () => {
    if (!profile) return;
    try {
      setIsLoading(true);
      const data = await debtsService.getByCustomer(profile.id);
      setDebts(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar la información de deuda');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getTotalDebt = () => {
    return debts.reduce((sum, debt) => sum + debt.remaining, 0);
  };

  const columns: Column<Debt>[] = [
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
        <span className="font-medium text-red-600">{formatCurrency(d.remaining)}</span>
      ),
    },
    {
      key: 'created_at',
      header: 'Fecha',
      render: (d) => new Date(d.created_at).toLocaleDateString('es-ES'),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Mi Deuda</h1>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Resumen */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Deuda Total Pendiente</p>
            <p className="text-3xl font-bold text-red-600">{formatCurrency(getTotalDebt())}</p>
            <p className="text-sm text-slate-500 mt-1">{debts.length} deuda(s) pendiente(s)</p>
          </div>
          {getTotalDebt() > 0 && (
            <Button onClick={() => navigate(ROUTES.CUSTOMER_PAYMENTS)}>
              Solicitar Abono
            </Button>
          )}
        </div>
      </Card>

      {/* Tabla de deudas */}
      <Table
        data={debts}
        columns={columns}
        keyExtractor={(d) => d.id}
        isLoading={isLoading}
        emptyMessage="¡No tienes deudas pendientes!"
      />
    </div>
  );
}
