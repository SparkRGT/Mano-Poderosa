import type { Category } from './category.interface';

export interface Product {
  id: number;
  product_code: string;
  name: string;
  price: number;
  stock: number;
  category_id: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Relación
  category?: Category;
}

export interface ProductInsert {
  product_code: string;
  name: string;
  price: number;
  stock?: number;
  category_id?: number | null;
  is_active?: boolean;
}

export interface ProductUpdate {
  product_code?: string;
  name?: string;
  price?: number;
  stock?: number;
  category_id?: number | null;
  is_active?: boolean;
}

export interface ProductWithCategory extends Product {
  category?: Category;
}
