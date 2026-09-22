export interface Setting {
  id: number;
  key: string;
  value: string;
  description: string | null;
  updated_at: string;
}

export interface SettingUpdate {
  value: string;
}

// Tipos específicos de configuración
export interface AppSettings {
  min_stock_alert: number;
  admin_whatsapp: string;
  invoice_prefix: string;
}
