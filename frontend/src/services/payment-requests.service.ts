import { supabase } from '../supabase';
import type { PaymentRequest, PaymentRequestInsert } from '../interfaces';
import { debtsService } from './debts.service';

export const paymentRequestsService = {
  /**
   * Obtiene todas las solicitudes (admin)
   */
  async getAll(): Promise<PaymentRequest[]> {
    const { data, error } = await supabase
      .from('payment_requests')
      .select(`
        *,
        customer:users!customer_id(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Obtiene solicitudes pendientes (admin)
   */
  async getPending(): Promise<PaymentRequest[]> {
    const { data, error } = await supabase
      .from('payment_requests')
      .select(`
        *,
        customer:users!customer_id(*)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Obtiene solicitudes de un cliente
   */
  async getByCustomer(customerId: string): Promise<PaymentRequest[]> {
    const { data, error } = await supabase
      .from('payment_requests')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Obtiene una solicitud por ID
   */
  async getById(id: number): Promise<PaymentRequest | null> {
    const { data, error } = await supabase
      .from('payment_requests')
      .select(`
        *,
        customer:users!customer_id(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Crea una nueva solicitud (cliente)
   */
  async create(request: PaymentRequestInsert): Promise<PaymentRequest> {
    const { data, error } = await supabase
      .from('payment_requests')
      .insert(request)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Aprueba una solicitud (admin)
   */
  async approve(id: number, adminId: string, adminNotes?: string): Promise<void> {
    // Obtener la solicitud
    const { data: request, error: fetchError } = await supabase
      .from('payment_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    if (!request) throw new Error('Solicitud no encontrada');

    // Actualizar estado
    const { error: updateError } = await supabase
      .from('payment_requests')
      .update({
        status: 'approved',
        admin_notes: adminNotes,
        resolved_by: adminId,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) throw updateError;

    // Aplicar el abono a las deudas del cliente
    await debtsService.applyPayment(request.customer_id, request.amount);
  },

  /**
   * Rechaza una solicitud (admin)
   */
  async reject(id: number, adminId: string, adminNotes?: string): Promise<void> {
    const { error } = await supabase
      .from('payment_requests')
      .update({
        status: 'rejected',
        admin_notes: adminNotes,
        resolved_by: adminId,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Cuenta solicitudes pendientes
   */
  async countPending(): Promise<number> {
    const { count, error } = await supabase
      .from('payment_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (error) throw error;
    return count || 0;
  },
};
