import { supabase } from '../supabase';
import type { User, UserUpdate } from '../interfaces';

export const usersService = {
  /**
   * Obtiene todos los usuarios (solo admin)
   */
  async getAll(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Obtiene todos los clientes (solo admin)
   */
  async getCustomers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'customer')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Obtiene un usuario por ID
   */
  async getById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Actualiza un usuario
   */
  async update(id: string, userData: UserUpdate): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Elimina un usuario (solo admin)
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Busca usuarios por nombre o email
   */
  async search(query: string): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
      .eq('role', 'customer')
      .limit(10);

    if (error) throw error;
    return data || [];
  },
};
