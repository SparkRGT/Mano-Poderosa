import { supabase } from '../supabase';
import type { Setting, AppSettings } from '../interfaces';

export const settingsService = {
  /**
   * Obtiene todas las configuraciones
   */
  async getAll(): Promise<Setting[]> {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .order('key', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Obtiene una configuración por key
   */
  async getByKey(key: string): Promise<Setting | null> {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('key', key)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Obtiene el valor de una configuración
   */
  async getValue(key: string): Promise<string | null> {
    const setting = await this.getByKey(key);
    return setting?.value || null;
  },

  /**
   * Actualiza una configuración
   */
  async update(key: string, value: string): Promise<Setting> {
    const { data, error } = await supabase
      .from('settings')
      .update({ value })
      .eq('key', key)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Obtiene todas las configuraciones como objeto
   */
  async getAppSettings(): Promise<AppSettings> {
    const settings = await this.getAll();
    
    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    return {
      min_stock_alert: parseInt(settingsMap['min_stock_alert'] || '10', 10),
      admin_whatsapp: settingsMap['admin_whatsapp'] || '',
      invoice_prefix: settingsMap['invoice_prefix'] || 'FAC-',
    };
  },

  /**
   * Actualiza múltiples configuraciones
   */
  async updateMultiple(settings: Partial<AppSettings>): Promise<void> {
    const updates = Object.entries(settings).map(([key, value]) =>
      supabase
        .from('settings')
        .update({ value: String(value) })
        .eq('key', key)
    );

    await Promise.all(updates);
  },
};
