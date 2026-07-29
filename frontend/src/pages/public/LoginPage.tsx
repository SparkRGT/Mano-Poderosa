import { useNavigate, useLocation } from 'react-router-dom';
import { LoginForm } from '../../components/auth';
import { useAuth } from '../../context';
import { useEffect } from 'react';
import { ROUTES, APP_NAME } from '../../config/constants';

export function LoginPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (profile) {
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else if (profile.role === 'admin') {
        navigate(ROUTES.ADMIN, { replace: true });
      } else {
        navigate(ROUTES.CUSTOMER, { replace: true });
      }
    }
  }, [profile, navigate, location]);

  const handleSuccess = () => {
    // El useEffect se encargará de la redirección
  };

  return (
    <div className="min-h-screen bg-sky-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-md border border-sky-100 p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-sky-700">{APP_NAME}</h1>
            <p className="mt-2 text-sm text-slate-600">Inicia sesión en tu cuenta</p>
          </div>

          {/* Form */}
          <LoginForm onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  );
}
