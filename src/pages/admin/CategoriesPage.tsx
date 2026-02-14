import { useState, useEffect } from 'react';
import { Button, Input, Modal, Table, Alert } from '../../components/ui';
import type { Column } from '../../components/ui';
import { categoriesService } from '../../services';
import type { Category, CategoryInsert } from '../../interfaces';

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Category | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await categoriesService.getAll();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar las categorías');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name });
    } else {
      setEditingCategory(null);
      setFormData({ name: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setIsSaving(true);
      if (editingCategory) {
        await categoriesService.update(editingCategory.id, { name: formData.name });
      } else {
        await categoriesService.create({ name: formData.name } as CategoryInsert);
      }
      await loadCategories();
      handleCloseModal();
    } catch (err) {
      setError('Error al guardar la categoría');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await categoriesService.delete(deleteConfirm.id);
      await loadCategories();
      setDeleteConfirm(null);
    } catch (err) {
      setError('Error al eliminar la categoría. Puede tener productos asociados.');
      console.error(err);
    }
  };

  const columns: Column<Category>[] = [
    { key: 'id', header: 'ID', className: 'w-20' },
    { key: 'name', header: 'Nombre' },
    {
      key: 'created_at',
      header: 'Fecha de Creación',
      render: (cat) => new Date(cat.created_at).toLocaleDateString('es-ES'),
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'w-40',
      render: (cat) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => handleOpenModal(cat)}>
            Editar
          </Button>
          <Button size="sm" variant="danger" onClick={() => setDeleteConfirm(cat)}>
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Categorías</h1>
        <Button onClick={() => handleOpenModal()}>+ Nueva Categoría</Button>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Table
        data={categories}
        columns={columns}
        keyExtractor={(cat) => cat.id}
        isLoading={isLoading}
        emptyMessage="No hay categorías registradas"
      />

      {/* Modal crear/editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Nombre de la categoría"
            value={formData.name}
            onChange={(e) => setFormData({ name: e.target.value })}
            placeholder="Ej: Electrónicos"
            required
            autoFocus
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSaving}>
              {editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}
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
            ¿Estás seguro de eliminar la categoría <strong>{deleteConfirm?.name}</strong>?
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
