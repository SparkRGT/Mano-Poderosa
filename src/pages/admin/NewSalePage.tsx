import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Select, Card, Alert, Badge } from '../../components/ui';
import { productsService, usersService, salesService } from '../../services';
import type { ProductWithCategory, User, CartItem, SaleInsert } from '../../interfaces';
import { ROUTES } from '../../config/constants';
import { useAuth } from '../../context';

export function NewSalePage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Formulario
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchProduct, setSearchProduct] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'pending'>('paid');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [productsData, customersData] = await Promise.all([
        productsService.getActive(),
        usersService.getCustomers(),
      ]);
      setProducts(productsData);
      setCustomers(customersData);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    const product = products.find((p) => p.id.toString() === selectedProduct);
    if (!product) return;

    const qty = parseInt(quantity) || 1;
    if (qty <= 0) return;
    if (qty > product.stock) {
      setError(`Solo hay ${product.stock} unidades en stock`);
      return;
    }

    const existingIndex = cart.findIndex((item) => item.product.id === product.id);
    if (existingIndex >= 0) {
      const newCart = [...cart];
      const newQty = newCart[existingIndex].quantity + qty;
      if (newQty > product.stock) {
        setError(`Solo hay ${product.stock} unidades en stock`);
        return;
      }
      newCart[existingIndex].quantity = newQty;
      newCart[existingIndex].subtotal = newQty * product.price;
      setCart(newCart);
    } else {
      setCart([
        ...cart,
        {
          product,
          quantity: qty,
          subtotal: qty * product.price,
        },
      ]);
    }

    setSelectedProduct('');
    setQuantity('1');
    setError(null);
  };

  const handleRemoveFromCart = (productId: number) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const handleUpdateQuantity = (productId: number, newQty: number) => {
    const item = cart.find((item) => item.product.id === productId);
    if (!item) return;

    if (newQty <= 0) {
      handleRemoveFromCart(productId);
      return;
    }

    if (newQty > item.product.stock) {
      setError(`Solo hay ${item.product.stock} unidades en stock`);
      return;
    }

    setCart(
      cart.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: newQty, subtotal: newQty * item.product.price }
          : item
      )
    );
    setError(null);
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomer) {
      setError('Selecciona un cliente');
      return;
    }

    if (cart.length === 0) {
      setError('Agrega al menos un producto');
      return;
    }

    try {
      setIsSaving(true);
      const saleData: SaleInsert = {
        customer_id: selectedCustomer,
        total: getTotal(),
        status: paymentStatus,
        notes: notes || undefined,
        created_by: profile?.id || '',
      };

      await salesService.create(saleData, cart);
      navigate(ROUTES.ADMIN_SALES);
    } catch (err) {
      setError('Error al crear la venta');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
      p.product_code.toLowerCase().includes(searchProduct.toLowerCase())
  );

  const customerOptions = customers.map((c) => ({ value: c.id, label: `${c.name} (${c.email})` }));
  const productOptions = filteredProducts.map((p) => ({
    value: p.id,
    label: `${p.product_code} - ${p.name} (${formatCurrency(p.price)}) - Stock: ${p.stock}`,
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Nueva Venta</h1>
        <Button variant="ghost" onClick={() => navigate(ROUTES.ADMIN_SALES)}>
          Cancelar
        </Button>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda - Selección de productos */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-4">
              <h3 className="font-medium mb-4">Agregar Productos</h3>
              <div className="space-y-4">
                <Input
                  placeholder="Buscar producto por nombre o código..."
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                />
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select
                      options={productOptions}
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      placeholder="Seleccionar producto"
                    />
                  </div>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-24"
                    placeholder="Cant."
                  />
                  <Button type="button" onClick={handleAddToCart} disabled={!selectedProduct}>
                    Agregar
                  </Button>
                </div>
              </div>
            </Card>

            {/* Carrito */}
            <Card className="p-4">
              <h3 className="font-medium mb-4">Carrito de Venta</h3>
              {cart.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No hay productos en el carrito</p>
              ) : (
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between p-3 bg-sky-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-slate-500">
                          {item.product.product_code} - {formatCurrency(item.product.price)} c/u
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </div>
                        <span className="w-24 text-right font-medium">
                          {formatCurrency(item.subtotal)}
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant="danger"
                          onClick={() => handleRemoveFromCart(item.product.id)}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Columna derecha - Resumen */}
          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="font-medium mb-4">Información de Venta</h3>
              <div className="space-y-4">
                <Select
                  label="Cliente"
                  options={customerOptions}
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  placeholder="Seleccionar cliente"
                  required
                />
                <Select
                  label="Estado de Pago"
                  options={[
                    { value: 'paid', label: 'Pagada' },
                    { value: 'pending', label: 'Pendiente (Genera Deuda)' },
                  ]}
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as 'paid' | 'pending')}
                />
                <Input
                  label="Notas (opcional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Observaciones..."
                />
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-medium mb-4">Resumen</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Productos</span>
                  <span>{cart.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Unidades</span>
                  <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-sky-600">{formatCurrency(getTotal())}</span>
                </div>
              </div>
              {paymentStatus === 'pending' && (
                <Badge variant="warning" className="mt-3 w-full justify-center">
                  Esta venta generará una deuda
                </Badge>
              )}
            </Card>

            <Button type="submit" className="w-full" size="lg" isLoading={isSaving}>
              Confirmar Venta
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
