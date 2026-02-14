import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context';
import { ProtectedRoute, RoleGuard } from './components/auth';
import { AdminLayout, CustomerLayout } from './components/layout';
import { ROUTES } from './config/constants';

// Public Pages
import { LoginPage, RegisterPage, NotFoundPage } from './pages/public';

// Admin Pages
import {
  DashboardPage,
  ProductsPage,
  CategoriesPage,
  SalesPage,
  NewSalePage,
  InvoicesPage,
  CustomersPage,
  DebtsPage,
  PaymentRequestsPage,
  ReportsPage,
  SettingsPage,
} from './pages/admin';

// Customer Pages
import {
  CatalogPage,
  MyPurchasesPage,
  MyInvoicesPage,
  MyDebtPage,
  MyPaymentRequestsPage,
} from './pages/customer';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

          {/* Admin Routes */}
          <Route
            path={ROUTES.ADMIN}
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['admin']}>
                  <AdminLayout />
                </RoleGuard>
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="productos" element={<ProductsPage />} />
            <Route path="categorias" element={<CategoriesPage />} />
            <Route path="ventas" element={<SalesPage />} />
            <Route path="nueva-venta" element={<NewSalePage />} />
            <Route path="facturas" element={<InvoicesPage />} />
            <Route path="clientes" element={<CustomersPage />} />
            <Route path="deudas" element={<DebtsPage />} />
            <Route path="solicitudes" element={<PaymentRequestsPage />} />
            <Route path="reportes" element={<ReportsPage />} />
            <Route path="configuracion" element={<SettingsPage />} />
          </Route>

          {/* Customer Routes */}
          <Route
            path={ROUTES.CUSTOMER}
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['customer']}>
                  <CustomerLayout />
                </RoleGuard>
              </ProtectedRoute>
            }
          >
            <Route index element={<CatalogPage />} />
            <Route path="compras" element={<MyPurchasesPage />} />
            <Route path="facturas" element={<MyInvoicesPage />} />
            <Route path="deuda" element={<MyDebtPage />} />
            <Route path="solicitudes" element={<MyPaymentRequestsPage />} />
          </Route>

          {/* Redirects */}
          <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
