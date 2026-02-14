import type { User } from './user.interface';
import type { Sale } from './sale.interface';

export type DebtType = 'sale' | 'external';

export interface Debt {
  id: number;
  customer_id: string;
  concept: string;
  amount: number;
  remaining: number;
  sale_id: number | null;
  type: DebtType;
  created_at: string;
  created_by: string;
  // Relaciones
  customer?: User;
  sale?: Sale;
}

export interface DebtInsert {
  customer_id: string;
  concept: string;
  amount: number;
  remaining: number;
  sale_id?: number | null;
  type: DebtType;
  created_by: string;
}

export interface DebtUpdate {
  remaining?: number;
}

export interface CustomerDebtSummary {
  customer_id: string;
  total_debt: number;
  debt_count: number;
  customer?: User;
}
