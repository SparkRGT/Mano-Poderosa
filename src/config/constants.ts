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
  ADMIN_PRODUCTS: '/admin/productos',
  ADMIN_CATEGORIES: '/admin/categorias',
  ADMIN_SALES: '/admin/ventas',
  ADMIN_NEW_SALE: '/admin/nueva-venta',
  ADMIN_INVOICES: '/admin/facturas',
  ADMIN_CUSTOMERS: '/admin/clientes',
  ADMIN_DEBTS: '/admin/deudas',
  ADMIN_PAYMENT_REQUESTS: '/admin/solicitudes',
  ADMIN_REPORTS: '/admin/reportes',
  ADMIN_SETTINGS: '/admin/configuracion',
  
  // Cliente
  CUSTOMER: '/cliente',
  CUSTOMER_CATALOG: '/cliente',
  CUSTOMER_PURCHASES: '/cliente/compras',
  CUSTOMER_INVOICES: '/cliente/facturas',
  CUSTOMER_DEBT: '/cliente/deuda',
  CUSTOMER_PAYMENTS: '/cliente/solicitudes',
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
