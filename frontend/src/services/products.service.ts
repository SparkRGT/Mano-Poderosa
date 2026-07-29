import { supabase } from '../supabase';
import type { Product, ProductInsert, ProductUpdate, ProductWithCategory } from '../interfaces';

export const productsService = {
  /**
   * Obtiene todos los productos con su categoría
   */
  async getAll(): Promise<ProductWithCategory[]> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Obtiene productos activos (para catálogo)
   */
  async getActive(): Promise<ProductWithCategory[]> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('is_active', true)
      .gt('stock', 0)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Obtiene productos por categoría
   */
  async getByCategory(categoryId: number): Promise<ProductWithCategory[]> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Obtiene un producto por ID
   */
  async getById(id: number): Promise<ProductWithCategory | null> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Obtiene un producto por código
   */
  async getByCode(code: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('product_code', code)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Crea un nuevo producto
   */
  async create(product: ProductInsert): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Actualiza un producto
   */
  async update(id: number, product: ProductUpdate): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Elimina un producto (soft delete - desactiva)
   */
  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Elimina un producto permanentemente
   */
  async hardDelete(id: number): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Busca productos por nombre o código
   */
  async search(query: string): Promise<ProductWithCategory[]> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)
      .or(`name.ilike.%${query}%,product_code.ilike.%${query}%`)
      .eq('is_active', true)
      .limit(20);

    if (error) throw error;
    return data || [];
  },

  /**
   * Obtiene productos con stock bajo
   */
  async getLowStock(): Promise<ProductWithCategory[]> {
    const { data, error } = await supabase
      .from('low_stock_products')
      .select('*');

    if (error) throw error;
    return data || [];
  },

  /**
   * Actualiza el stock de un producto
   */
  async updateStock(id: number, stock: number): Promise<void> {
    const { error } = await supabase
      .from('products')
      .update({ stock })
      .eq('id', id);

    if (error) throw error;
  },
};
