import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Product, CartItem } from '../interfaces';

interface CartContextType {
  items: CartItem[];
  total: number;
  itemCount: number;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: number) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Calcular total
  const total = items.reduce((sum, item) => sum + item.subtotal, 0);
  
  // Contar items
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Agregar producto al carrito
  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.product.id === product.id);
      
      if (existingItem) {
        // Actualizar cantidad si ya existe
        return currentItems.map(item =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                subtotal: (item.quantity + quantity) * item.product.price,
              }
            : item
        );
      }
      
      // Agregar nuevo item
      return [
        ...currentItems,
        {
          product,
          quantity,
          subtotal: quantity * product.price,
        },
      ];
    });
  }, []);

  // Remover producto del carrito
  const removeItem = useCallback((productId: number) => {
    setItems(currentItems => currentItems.filter(item => item.product.id !== productId));
  }, []);

  // Actualizar cantidad de un producto
  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems(currentItems =>
      currentItems.map(item =>
        item.product.id === productId
          ? {
              ...item,
              quantity,
              subtotal: quantity * item.product.price,
            }
          : item
      )
    );
  }, [removeItem]);

  // Limpiar carrito
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // Obtener cantidad de un producto específico
  const getItemQuantity = useCallback((productId: number) => {
    const item = items.find(i => i.product.id === productId);
    return item?.quantity || 0;
  }, [items]);

  const value: CartContextType = {
    items,
    total,
    itemCount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemQuantity,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
