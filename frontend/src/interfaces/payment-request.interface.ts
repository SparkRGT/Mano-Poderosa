import type { User } from './user.interface';

export type PaymentRequestStatus = 'pending' | 'approved' | 'rejected';

export interface PaymentRequest {
  id: number;
  customer_id: string;
  amount: number;
  status: PaymentRequestStatus;
  notes: string | null;
  admin_notes: string | null;
  resolved_by: string | null;
  created_at: string;
  resolved_at: string | null;
  // Relaciones
  customer?: User;
  resolver?: User;
}

export interface PaymentRequestInsert {
  customer_id: string;
  amount: number;
  notes?: string;
}

export interface PaymentRequestUpdate {
  status?: PaymentRequestStatus;
  admin_notes?: string;
  resolved_by?: string;
  resolved_at?: string;
}
