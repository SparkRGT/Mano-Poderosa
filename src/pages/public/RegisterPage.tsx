import { useNavigate } from 'react-router-dom';
import { RegisterForm } from '../../components/auth';
import { useAuth } from '../../context';
import { useEffect } from 'react';
import { ROUTES, APP_NAME } from '../../config/constants';

export function RegisterPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (profile) {
      if (profile.role === 'admin') {
        navigate(ROUTES.ADMIN, { replace: true });
      } else {
        navigate(ROUTES.CUSTOMER, { replace: true });
      }
    }
  }, [profile, navigate]);

  const handleSuccess = () => {
    // El useEffect se encargará de la redirección cuando el profile se cargue
  };

  return (
    <div className="min-h-screen bg-sky-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-md border border-sky-100 p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-sky-700">{APP_NAME}</h1>
            <p className="mt-2 text-sm text-slate-600">Crea tu cuenta</p>
          </div>

          {/* Form */}
          <RegisterForm onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  );
}
