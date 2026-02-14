// Constantes globales de la aplicación

export const APP_NAME = 'Sistema de Ventas';

// Roles
export const ROLES = {
  ADMIN: 'admin',
  CUSTOMER: 'customer',
} as const;

// Estados de venta
export const SALE_STATUS = {
  PAID: 'paid',
  PENDING: 'pending',
} as const;

export const SALE_STATUS_LABELS: Record<string, string> = {
  paid: 'Pagado',
  pending: 'Pendiente',
};

// Tipos de deuda
export const DEBT_TYPE = {
  SALE: 'sale',
  EXTERNAL: 'external',
} as const;

export const DEBT_TYPE_LABELS: Record<string, string> = {
  sale: 'Venta',
  external: 'Externo',
};

// Estados de solicitud de pago
export const PAYMENT_REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export const PAYMENT_REQUEST_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
};

// Configuración de paginación
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
} as const;

// Keys de configuración
export const SETTINGS_KEYS = {
  MIN_STOCK_ALERT: 'min_stock_alert',
  ADMIN_WHATSAPP: 'admin_whatsapp',
  INVOICE_PREFIX: 'invoice_prefix',
} as const;

// Rutas de la aplicación
export const ROUTES = {
  // Públicas
  LOGIN: '/login',
  REGISTER: '/register',
  
  // Admin
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_SALES: '/admin/sales',
  ADMIN_NEW_SALE: '/admin/sales/new',
  ADMIN_INVOICES: '/admin/invoices',
  ADMIN_CUSTOMERS: '/admin/customers',
  ADMIN_DEBTS: '/admin/debts',
  ADMIN_PAYMENT_REQUESTS: '/admin/payment-requests',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_SETTINGS: '/admin/settings',
  
  // Cliente
  CUSTOMER: '/customer',
  CUSTOMER_CATALOG: '/customer',
  CUSTOMER_PURCHASES: '/customer/purchases',
  CUSTOMER_INVOICES: '/customer/invoices',
  CUSTOMER_DEBT: '/customer/debt',
  CUSTOMER_PAYMENTS: '/customer/payments',
} as const;

// Colores para estados (Tailwind)
export const STATUS_COLORS = {
  // Ventas
  paid: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  
  // Solicitudes de pago
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
} as const;
