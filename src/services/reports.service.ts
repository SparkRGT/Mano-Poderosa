import { supabase } from '../supabase';

export interface SalesReportData {
  date: string;
  total_sales: number;
  total_amount: number;
}

export interface TopProductData {
  product_id: number;
  product_name: string;
  product_code: string;
  total_quantity: number;
  total_revenue: number;
}

export interface InventoryReportData {
  id: number;
  product_code: string;
  name: string;
  stock: number;
  category_name: string | null;
  status: 'low' | 'normal' | 'out';
}

export const reportsService = {
  /**
   * Reporte de ventas por período
   */
  async getSalesByPeriod(
    startDate: string,
    endDate: string,
    groupBy: 'day' | 'week' | 'month' = 'day'
  ): Promise<SalesReportData[]> {
    const { data: sales, error } = await supabase
      .from('sales')
      .select('created_at, total, status')
      .eq('status', 'paid')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: true });

    if (error) throw error;
    if (!sales) return [];

    // Agrupar por período
    const grouped = new Map<string, { total_sales: number; total_amount: number }>();

    sales.forEach(sale => {
      const date = new Date(sale.created_at);
      let key: string;

      switch (groupBy) {
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      const existing = grouped.get(key) || { total_sales: 0, total_amount: 0 };
      grouped.set(key, {
        total_sales: existing.total_sales + 1,
        total_amount: existing.total_amount + Number(sale.total),
      });
    });

    return Array.from(grouped.entries()).map(([date, data]) => ({
      date,
      ...data,
    }));
  },

  /**
   * Productos más vendidos
   */
  async getTopProducts(
    startDate: string,
    endDate: string,
    limit = 10
  ): Promise<TopProductData[]> {
    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select('id')
      .eq('status', 'paid')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (salesError) throw salesError;
    if (!sales || sales.length === 0) return [];

    const saleIds = sales.map(s => s.id);

    const { data: items, error: itemsError } = await supabase
      .from('sale_items')
      .select('product_id, product_name, product_code, quantity, subtotal')
      .in('sale_id', saleIds);

    if (itemsError) throw itemsError;
    if (!items) return [];

    // Agrupar por producto
    const productMap = new Map<number, TopProductData>();

    items.forEach(item => {
      const existing = productMap.get(item.product_id) || {
        product_id: item.product_id,
        product_name: item.product_name,
        product_code: item.product_code,
        total_quantity: 0,
        total_revenue: 0,
      };

      productMap.set(item.product_id, {
        ...existing,
        total_quantity: existing.total_quantity + item.quantity,
        total_revenue: existing.total_revenue + Number(item.subtotal),
      });
    });

    return Array.from(productMap.values())
      .sort((a, b) => b.total_quantity - a.total_quantity)
      .slice(0, limit);
  },

  /**
   * Reporte de inventario
   */
  async getInventoryReport(minStockThreshold = 10): Promise<InventoryReportData[]> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        product_code,
        name,
        stock,
        category:categories(name)
      `)
      .eq('is_active', true)
      .order('stock', { ascending: true });

    if (error) throw error;
    if (!data) return [];

    return data.map(product => ({
      id: product.id,
      product_code: product.product_code,
      name: product.name,
      stock: product.stock,
      category_name: (product.category as { name: string }[] | null)?.[0]?.name || null,
      status: product.stock === 0 
        ? 'out' 
        : product.stock <= minStockThreshold 
          ? 'low' 
          : 'normal',
    }));
  },

  /**
   * Estadísticas generales del dashboard
   */
  async getDashboardStats(): Promise<{
    totalSalesToday: number;
    totalAmountToday: number;
    totalSalesMonth: number;
    totalAmountMonth: number;
    lowStockCount: number;
    pendingPaymentRequests: number;
  }> {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
    const endOfDay = new Date().toISOString();

    // Ventas de hoy
    const { data: salesToday } = await supabase
      .from('sales')
      .select('total')
      .eq('status', 'paid')
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay);

    // Ventas del mes
    const { data: salesMonth } = await supabase
      .from('sales')
      .select('total')
      .eq('status', 'paid')
      .gte('created_at', startOfMonth)
      .lte('created_at', endOfDay);

    // Productos con stock bajo
    const { count: lowStockCount } = await supabase
      .from('low_stock_products')
      .select('*', { count: 'exact', head: true });

    // Solicitudes de pago pendientes
    const { count: pendingRequests } = await supabase
      .from('payment_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const todaySales = salesToday || [];
    const monthSales = salesMonth || [];

    return {
      totalSalesToday: todaySales.length,
      totalAmountToday: todaySales.reduce((sum, s) => sum + Number(s.total), 0),
      totalSalesMonth: monthSales.length,
      totalAmountMonth: monthSales.reduce((sum, s) => sum + Number(s.total), 0),
      lowStockCount: lowStockCount || 0,
      pendingPaymentRequests: pendingRequests || 0,
    };
  },
};
