import { useState, useEffect } from 'react';
import { Button, Input, Modal, Table, Alert, Badge } from '../../components/ui';
import type { Column } from '../../components/ui';
import { usersService, authService } from '../../services';
import type { User, UserInsert, UserUpdate } from '../../interfaces';

export function CustomersPage() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      const data = await usersService.getCustomers();
      setCustomers(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los clientes');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (customer?: User) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone || '',
        password: '',
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    try {
      setIsSaving(true);
      if (editingCustomer) {
        const updateData: UserUpdate = {
          name: formData.name,
          phone: formData.phone,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await usersService.update(editingCustomer.id, updateData);
      } else {
        if (!formData.password) {
          setError('La contraseña es requerida para nuevos clientes');
          return;
        }
        const userData: UserInsert = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: 'customer',
        };
        await authService.signUp(userData);
      }
      await loadCustomers();
      handleCloseModal();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el cliente');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await usersService.delete(deleteConfirm.id);
      await loadCustomers();
      setDeleteConfirm(null);
    } catch (err) {
      setError('Error al eliminar el cliente. Puede tener ventas o deudas asociadas.');
      console.error(err);
    }
  };

  const columns: Column<User>[] = [
    { key: 'name', header: 'Nombre' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Teléfono', render: (c) => c.phone || '-' },
    {
      key: 'created_at',
      header: 'Registrado',
      render: (c) => new Date(c.created_at).toLocaleDateString('es-ES'),
    },
    {
      key: 'role',
      header: 'Rol',
      render: (c) => (
        <Badge variant={c.role === 'admin' ? 'info' : 'default'}>
          {c.role === 'admin' ? 'Admin' : 'Cliente'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'w-40',
      render: (c) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => handleOpenModal(c)}>
            Editar
          </Button>
          <Button size="sm" variant="danger" onClick={() => setDeleteConfirm(c)}>
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Clientes</h1>
        <Button onClick={() => handleOpenModal()}>+ Nuevo Cliente</Button>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Table
        data={customers}
        columns={columns}
        keyExtractor={(c) => c.id}
        isLoading={isLoading}
        emptyMessage="No hay clientes registrados"
      />

      {/* Modal crear/editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Nombre"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Nombre completo"
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="correo@ejemplo.com"
            disabled={!!editingCustomer}
            required
          />
          <Input
            label="Teléfono"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="Número de teléfono"
          />
          <Input
            label={editingCustomer ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="••••••••"
            required={!editingCustomer}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSaving}>
              {editingCustomer ? 'Guardar Cambios' : 'Crear Cliente'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal confirmar eliminación */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Confirmar Eliminación"
        size="sm"
      >
        <div className="p-6">
          <p className="text-slate-600 mb-6">
            ¿Estás seguro de eliminar al cliente <strong>{deleteConfirm?.name}</strong>?
            Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
