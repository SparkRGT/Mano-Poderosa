import { useState, useEffect } from 'react';
import { Button, Input, Select, Modal, Table, Alert, Badge } from '../../components/ui';
import type { Column } from '../../components/ui';
import { productsService, categoriesService } from '../../services';
import type { ProductWithCategory, ProductInsert, Category } from '../../interfaces';

export function ProductsPage() {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithCategory | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<ProductWithCategory | null>(null);
  const [sortOrder, setSortOrder] = useState<'id_asc' | 'id_desc' | 'name_asc' | 'name_desc'>('id_asc');
  const [formData, setFormData] = useState({
    product_code: '',
    name: '',
    price: '',
    stock: '',
    category_id: '',
    is_active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        productsService.getAll(),
        categoriesService.getAll(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setError(null);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (product?: ProductWithCategory) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        product_code: product.product_code,
        name: product.name,
        price: product.price.toString(),
        stock: product.stock.toString(),
        category_id: product.category_id?.toString() || '',
        is_active: product.is_active,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        product_code: '',
        name: '',
        price: '',
        stock: '0',
        category_id: '',
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.product_code.trim()) return;

    try {
      setIsSaving(true);
      const productData: ProductInsert = {
        product_code: formData.product_code,
        name: formData.name,
        price: parseFloat(formData.price) || 0,
        stock: parseInt(formData.stock) || 0,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        is_active: formData.is_active,
      };

      if (editingProduct) {
        await productsService.update(editingProduct.id, productData);
      } else {
        await productsService.create(productData);
      }
      await loadData();
      handleCloseModal();
    } catch (err) {
      setError('Error al guardar el producto');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await productsService.delete(deleteConfirm.id);
      await loadData();
      setDeleteConfirm(null);
    } catch (err) {
      setError('Error al eliminar el producto');
      console.error(err);
    }
  };

  const handleToggleActive = async (product: ProductWithCategory) => {
    try {
      await productsService.update(product.id, { is_active: !product.is_active });
      await loadData();
    } catch (err) {
      setError('Error al actualizar el producto');
      console.error(err);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortOrder) {
      case 'id_asc':
        return a.id - b.id;
      case 'id_desc':
        return b.id - a.id;
      case 'name_asc':
        return a.name.localeCompare(b.name);
      case 'name_desc':
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  const sortOptions = [
    { value: 'id_asc', label: 'ID (Ascendente)' },
    { value: 'id_desc', label: 'ID (Descendente)' },
    { value: 'name_asc', label: 'Nombre (A-Z)' },
    { value: 'name_desc', label: 'Nombre (Z-A)' },
  ];

  const columns: Column<ProductWithCategory>[] = [
    { key: 'product_code', header: 'Código', className: 'w-28' },
    { key: 'name', header: 'Nombre' },
    {
      key: 'category',
      header: 'Categoría',
      render: (p) => p.category?.name || '-',
    },
    {
      key: 'price',
      header: 'Precio',
      render: (p) => formatCurrency(p.price),
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (p) => (
        <Badge variant={p.stock > 10 ? 'success' : p.stock > 0 ? 'warning' : 'error'}>
          {p.stock}
        </Badge>
      ),
    },
    {
      key: 'is_active',
      header: 'Estado',
      render: (p) => (
        <Badge variant={p.is_active ? 'success' : 'default'}>
          {p.is_active ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'w-52',
      render: (p) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => handleOpenModal(p)}>
            Editar
          </Button>
          <Button size="sm" variant="secondary" onClick={() => handleToggleActive(p)}>
            {p.is_active ? 'Desactivar' : 'Activar'}
          </Button>
          <Button size="sm" variant="danger" onClick={() => setDeleteConfirm(p)}>
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Productos</h1>
        <Button onClick={() => handleOpenModal()} className="w-full sm:w-auto shrink-0">+ Nuevo Producto</Button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <label className="text-sm font-medium text-slate-700">Ordenar por:</label>
          <Select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
            options={sortOptions}
            className="w-full sm:w-48"
          />
        </div>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Table
        data={sortedProducts}
        columns={columns}
        keyExtractor={(p) => p.id}
        isLoading={isLoading}
        emptyMessage="No hay productos registrados"
      />

      {/* Modal crear/editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Código"
              value={formData.product_code}
              onChange={(e) => setFormData({ ...formData, product_code: e.target.value })}
              placeholder="Ej: PROD001"
              required
            />
            <Input
              label="Nombre"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nombre del producto"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Precio"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="0.00"
              required
            />
            <Input
              label="Stock"
              type="number"
              min="0"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              placeholder="0"
            />
          </div>
          <Select
            label="Categoría"
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            options={categoryOptions}
            placeholder="Seleccionar categoría"
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-sky-600 border-sky-300 rounded focus:ring-sky-500"
            />
            <label htmlFor="is_active" className="text-sm text-slate-700">
              Producto activo
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSaving}>
              {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
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
            ¿Estás seguro de eliminar el producto <strong>{deleteConfirm?.name}</strong>?
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
