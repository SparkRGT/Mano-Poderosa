import type { Sale, SaleItem } from './sale.interface';

export interface Invoice {
  id: number;
  invoice_number: string;
  sale_id: number;
  customer_id: string;
  customer_email: string;
  customer_name: string;
  total: number;
  created_at: string;
  // Relaciones
  sale?: Sale;
  items?: SaleItem[];
}

export interface InvoiceWithDetails extends Invoice {
  sale: Sale & { items: SaleItem[] };
}
