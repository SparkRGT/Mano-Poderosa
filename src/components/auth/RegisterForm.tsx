import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context';
import { Button, Input, Alert } from '../ui';
import { ROUTES } from '../../config/constants';
import { isValidEmail, isValidPhone } from '../../utils';

interface RegisterFormProps {
  onSuccess?: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar error del campo al escribir
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!isValidEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!isValidPhone(formData.phone)) {
      newErrors.phone = 'Teléfono inválido';
    }

    if (formData.password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    if (!validate()) return;

    setIsLoading(true);

    try {
      const { error } = await signUp(
        formData.email,
        formData.password,
        formData.name,
        formData.phone
      );

      if (error) {
        if (error.message.includes('already registered')) {
          setGeneralError('Este email ya está registrado');
        } else {
          setGeneralError('Error al crear la cuenta. Intenta de nuevo.');
        }
        return;
      }

      onSuccess?.();
    } catch {
      setGeneralError('Error inesperado. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {generalError && (
        <Alert variant="error">{generalError}</Alert>
      )}

      <Input
        label="Nombre completo"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Juan Pérez"
        error={errors.name}
        required
      />

      <Input
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="tu@email.com"
        error={errors.email}
        required
      />

      <Input
        label="Teléfono"
        name="phone"
        type="tel"
        value={formData.phone}
        onChange={handleChange}
        placeholder="+1 234 567 8900"
        error={errors.phone}
        required
      />

      <Input
        label="Contraseña"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="••••••••"
        error={errors.password}
        required
      />

      <Input
        label="Confirmar contraseña"
        name="confirmPassword"
        type="password"
        value={formData.confirmPassword}
        onChange={handleChange}
        placeholder="••••••••"
        error={errors.confirmPassword}
        required
      />

      <Button
        type="submit"
        className="w-full"
        isLoading={isLoading}
      >
        Crear Cuenta
      </Button>

      <p className="text-center text-sm text-gray-600">
        ¿Ya tienes cuenta?{' '}
        <Link
          to={ROUTES.LOGIN}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
