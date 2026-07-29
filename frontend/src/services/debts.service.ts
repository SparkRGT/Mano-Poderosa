import { supabase } from '../supabase';
import type { Debt, DebtInsert, DebtUpdate, CustomerDebtSummary } from '../interfaces';

export const debtsService = {
  /**
   * Obtiene todas las deudas (admin)
   */
  async getAll(): Promise<Debt[]> {
    const { data, error } = await supabase
      .from('debts')
      .select(`
        *,
        customer:users!customer_id(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Obtiene deudas pendientes (remaining > 0)
   */
  async getPending(): Promise<Debt[]> {
    const { data, error } = await supabase
      .from('debts')
      .select(`
        *,
        customer:users!customer_id(*)
      `)
      .gt('remaining', 0)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Obtiene deudas de un cliente
   */
  async getByCustomer(customerId: string): Promise<Debt[]> {
    const { data, error } = await supabase
      .from('debts')
      .select('*')
      .eq('customer_id', customerId)
      .gt('remaining', 0)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Obtiene una deuda por ID
   */
  async getById(id: number): Promise<Debt | null> {
    const { data, error } = await supabase
      .from('debts')
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
   * Crea una nueva deuda (externa/manual)
   */
  async create(debt: DebtInsert): Promise<Debt> {
    const { data, error } = await supabase
      .from('debts')
      .insert(debt)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Actualiza el saldo de una deuda
   */
  async update(id: number, debt: DebtUpdate): Promise<Debt> {
    const { data, error } = await supabase
      .from('debts')
      .update(debt)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Aplica un abono a las deudas de un cliente (FIFO)
   */
  async applyPayment(customerId: string, amount: number): Promise<void> {
    // Obtener deudas pendientes ordenadas por fecha (más antiguas primero)
    const { data: debts, error } = await supabase
      .from('debts')
      .select('*')
      .eq('customer_id', customerId)
      .gt('remaining', 0)
      .order('created_at', { ascending: true });

    if (error) throw error;
    if (!debts || debts.length === 0) return;

    let remainingPayment = amount;

    for (const debt of debts) {
      if (remainingPayment <= 0) break;

      const amountToApply = Math.min(remainingPayment, debt.remaining);
      const newRemaining = debt.remaining - amountToApply;

      await supabase
        .from('debts')
        .update({ remaining: newRemaining })
        .eq('id', debt.id);

      remainingPayment -= amountToApply;
    }
  },

  /**
   * Obtiene el resumen de deuda de un cliente
   */
  async getCustomerSummary(customerId: string): Promise<CustomerDebtSummary | null> {
    const { data, error } = await supabase
      .from('customer_debt_summary')
      .select('*')
      .eq('customer_id', customerId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Obtiene el resumen de todos los clientes con deuda
   */
  async getAllSummaries(): Promise<CustomerDebtSummary[]> {
    const { data, error } = await supabase
      .from('customer_debt_summary')
      .select(`
        *,
        customer:users!customer_id(*)
      `);

    if (error) throw error;
    return data || [];
  },

  /**
   * Obtiene el total de deuda de un cliente
   */
  async getTotalDebt(customerId: string): Promise<number> {
    const { data, error } = await supabase
      .from('debts')
      .select('remaining')
      .eq('customer_id', customerId)
      .gt('remaining', 0);

    if (error) throw error;
    
    return (data || []).reduce((sum: number, debt: Debt) => sum + Number(debt.remaining), 0);
  },
};
