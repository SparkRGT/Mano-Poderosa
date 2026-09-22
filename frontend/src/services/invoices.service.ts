import { supabase } from '../supabase';
import type { Invoice, InvoiceWithDetails, SaleItem } from '../interfaces';

export const invoicesService = {
  /**
   * Obtiene todas las facturas (admin)
   */
  async getAll(): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Obtiene facturas de un cliente
   */
  async getByCustomer(customerId: string): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Obtiene una factura por ID con detalles completos
   */
  async getById(id: number): Promise<InvoiceWithDetails | null> {
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();

    if (invoiceError) throw invoiceError;
    if (!invoice) return null;

    // Obtener items de la venta
    const { data: items, error: itemsError } = await supabase
      .from('sale_items')
      .select('*')
      .eq('sale_id', invoice.sale_id);

    if (itemsError) throw itemsError;

    return {
      ...invoice,
      sale: {
        id: invoice.sale_id,
        items: items || [],
      },
    } as InvoiceWithDetails;
  },

  /**
   * Obtiene una factura por número
   */
  async getByNumber(invoiceNumber: string): Promise<Invoice | null> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('invoice_number', invoiceNumber)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Obtiene los items de una factura
   */
  async getItems(invoiceId: number): Promise<SaleItem[]> {
    const { data: invoice } = await supabase
      .from('invoices')
      .select('sale_id')
      .eq('id', invoiceId)
      .single();

    if (!invoice) return [];

    const { data, error } = await supabase
      .from('sale_items')
      .select('*')
      .eq('sale_id', invoice.sale_id);

    if (error) throw error;
    return data || [];
  },

  /**
   * Busca facturas por número o nombre de cliente
   */
  async search(query: string): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .or(`invoice_number.ilike.%${query}%,customer_name.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data || [];
  },

  /**
   * Obtiene facturas por rango de fechas
   */
  async getByDateRange(startDate: string, endDate: string): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};
