import { Link } from 'react-router-dom';
import { Button } from '../../components/ui';
import { ROUTES } from '../../config/constants';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-300">404</h1>
        <h2 className="mt-4 text-3xl font-semibold text-gray-900">Página no encontrada</h2>
        <p className="mt-2 text-gray-600">
          Lo sentimos, la página que buscas no existe.
        </p>
        <div className="mt-6">
          <Link to={ROUTES.LOGIN}>
            <Button>Volver al inicio</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
