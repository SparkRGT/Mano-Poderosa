import { supabase } from '../supabase';
import type { Sale, SaleInsert, SaleItem, SaleItemInsert, SaleWithCustomer, CartItem } from '../interfaces';

export const salesService = {
  /**
   * Obtiene todas las ventas (admin)
   */
  async getAll(): Promise<SaleWithCustomer[]> {
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        customer:users!customer_id(*),
        invoice:invoices(invoice_number)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map((sale: any) => ({
      ...sale,
      invoice_number: sale.invoice?.[0]?.invoice_number || sale.invoice?.invoice_number,
    }));
  },

  /**
   * Obtiene ventas de un cliente específico
   */
  async getByCustomer(customerId: string): Promise<Sale[]> {
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        items:sale_items(*)
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Obtiene una venta por ID con sus items
   */
  async getById(id: number): Promise<Sale | null> {
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        customer:users!customer_id(*),
        items:sale_items(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Crea una nueva venta con sus items
   */
  async create(
    saleData: SaleInsert,
    cartItems: CartItem[]
  ): Promise<Sale> {
    // 1. Crear la venta
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert(saleData)
      .select()
      .single();

    if (saleError) throw saleError;

    // 2. Crear los items de la venta
    const saleItems: SaleItemInsert[] = cartItems.map(item => ({
      sale_id: sale.id,
      product_id: item.product.id,
      product_name: item.product.name,
      product_code: item.product.product_code,
      quantity: item.quantity,
      unit_price: item.product.price,
      subtotal: item.subtotal,
    }));

    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(saleItems);

    if (itemsError) throw itemsError;

    return sale;
  },

  /**
   * Obtiene los items de una venta
   */
  async getItems(saleId: number): Promise<SaleItem[]> {
    const { data, error } = await supabase
      .from('sale_items')
      .select('*')
      .eq('sale_id', saleId);

    if (error) throw error;
    return data || [];
  },

  /**
   * Actualiza el estado de una venta
   */
  async updateStatus(id: number, status: 'paid' | 'pending'): Promise<void> {
    const { error } = await supabase
      .from('sales')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Obtiene ventas por rango de fechas
   */
  async getByDateRange(startDate: string, endDate: string): Promise<SaleWithCustomer[]> {
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        customer:users!customer_id(*)
      `)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Obtiene el total de ventas por período
   */
  async getTotalByPeriod(startDate: string, endDate: string): Promise<number> {
    const { data, error } = await supabase
      .from('sales')
      .select('total')
      .eq('status', 'paid')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (error) throw error;
    
    return (data || []).reduce((sum: number, sale: Sale) => sum + Number(sale.total), 0);
  },
};
