import type { User } from './user.interface';
import type { Product } from './product.interface';

export type SaleStatus = 'paid' | 'pending';

export interface Sale {
  id: number;
  customer_id: string;
  total: number;
  status: SaleStatus;
  notes: string | null;
  created_at: string;
  created_by: string;
  // Relaciones
  customer?: User;
  items?: SaleItem[];
}

export interface SaleItem {
  id: number;
  sale_id: number;
  product_id: number;
  product_name: string;
  product_code: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  // Relación
  product?: Product;
}

export interface SaleInsert {
  customer_id: string;
  total: number;
  status?: SaleStatus;
  notes?: string;
  created_by: string;
}

export interface SaleItemInsert {
  sale_id: number;
  product_id: number;
  product_name: string;
  product_code: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

// Para el carrito de venta
export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

export interface SaleWithCustomer extends Sale {
  customer: User;
  invoice_number?: string;
}
