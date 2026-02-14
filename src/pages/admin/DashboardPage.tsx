import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui';
import { reportsService } from '../../services';
import { formatCurrency } from '../../utils';
import { ROUTES } from '../../config/constants';

interface DashboardStats {
  totalSalesToday: number;
  totalAmountToday: number;
  totalSalesMonth: number;
  totalAmountMonth: number;
  lowStockCount: number;
  pendingPaymentRequests: number;
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await reportsService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Ventas de Hoy',
      value: stats?.totalSalesToday || 0,
      subvalue: formatCurrency(stats?.totalAmountToday || 0),
      icon: ShoppingCartIcon,
      color: 'bg-sky-500',
      link: ROUTES.ADMIN_SALES,
    },
    {
      title: 'Ventas del Mes',
      value: stats?.totalSalesMonth || 0,
      subvalue: formatCurrency(stats?.totalAmountMonth || 0),
      icon: ChartIcon,
      color: 'bg-green-500',
      link: ROUTES.ADMIN_REPORTS,
    },
    {
      title: 'Stock Bajo',
      value: stats?.lowStockCount || 0,
      subvalue: 'productos',
      icon: AlertIcon,
      color: stats?.lowStockCount ? 'bg-red-500' : 'bg-gray-500',
      link: ROUTES.ADMIN_PRODUCTS,
    },
    {
      title: 'Solicitudes Pendientes',
      value: stats?.pendingPaymentRequests || 0,
      subvalue: 'por aprobar',
      icon: ClipboardIcon,
      color: stats?.pendingPaymentRequests ? 'bg-yellow-500' : 'bg-gray-500',
      link: ROUTES.ADMIN_PAYMENT_REQUESTS,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Link key={stat.title} to={stat.link}>
            <Card className="hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                  {isLoading ? (
                    <div className="h-8 w-16 bg-sky-100 animate-pulse rounded mt-1" />
                  ) : (
                    <>
                      <p className="text-2xl font-semibold text-slate-800">{stat.value}</p>
                      <p className="text-sm text-slate-500">{stat.subvalue}</p>
                    </>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to={ROUTES.ADMIN_NEW_SALE}
            className="flex flex-col items-center p-4 border border-sky-100 rounded-lg hover:bg-sky-50 transition-colors"
          >
            <PlusIcon className="w-8 h-8 text-sky-600" />
            <span className="mt-2 text-sm font-medium text-slate-800">Nueva Venta</span>
          </Link>
          <Link
            to={ROUTES.ADMIN_PRODUCTS}
            className="flex flex-col items-center p-4 border border-sky-100 rounded-lg hover:bg-sky-50 transition-colors"
          >
            <BoxIcon className="w-8 h-8 text-green-600" />
            <span className="mt-2 text-sm font-medium text-slate-800">Productos</span>
          </Link>
          <Link
            to={ROUTES.ADMIN_CUSTOMERS}
            className="flex flex-col items-center p-4 border border-sky-100 rounded-lg hover:bg-sky-50 transition-colors"
          >
            <UsersIcon className="w-8 h-8 text-sky-600" />
            <span className="mt-2 text-sm font-medium text-slate-800">Clientes</span>
          </Link>
          <Link
            to={ROUTES.ADMIN_REPORTS}
            className="flex flex-col items-center p-4 border border-sky-100 rounded-lg hover:bg-sky-50 transition-colors"
          >
            <ChartIcon className="w-8 h-8 text-sky-600" />
            <span className="mt-2 text-sm font-medium text-slate-800">Reportes</span>
          </Link>
        </div>
      </Card>
    </div>
  );
}

// Icons
function ShoppingCartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

function ClipboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function BoxIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}
