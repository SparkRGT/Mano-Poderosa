import { supabase } from '../supabase';
import type { User } from '../interfaces';

// Almacenar usuario en localStorage
const STORAGE_KEY = 'current_user';

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  phone: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export const authService = {
  /**
   * Registra un nuevo usuario (sin Supabase Auth)
   */
  async signUp({ email, password, name, phone }: SignUpData): Promise<{ user: User | null; error: Error | null }> {
    try {
      // Verificar si el email ya existe
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existing) {
        return { user: null, error: new Error('El email ya está registrado') };
      }

      // Crear usuario en la tabla users
      const { data, error } = await supabase
        .from('users')
        .insert({
          email,
          password, // En producción deberías hashear esto
          name,
          phone,
          role: 'customer',
        })
        .select()
        .single();

      if (error) {
        return { user: null, error };
      }

      // Guardar en localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

      return { user: data, error: null };
    } catch (err) {
      console.error('SignUp error:', err);
      return { user: null, error: err as Error };
    }
  },

  /**
   * Inicia sesión
   */
  async signIn({ email, password }: SignInData): Promise<{ user: User | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

      if (error || !data) {
        return { user: null, error: new Error('Credenciales incorrectas') };
      }

      // Guardar en localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

      return { user: data, error: null };
    } catch (err) {
      console.error('SignIn error:', err);
      return { user: null, error: err as Error };
    }
  },

  /**
   * Cierra sesión
   */
  async signOut(): Promise<{ error: Error | null }> {
    localStorage.removeItem(STORAGE_KEY);
    return { error: null };
  },

  /**
   * Obtiene el usuario actual desde localStorage
   */
  getCurrentUser(): User | null {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  /**
   * Obtiene el perfil del usuario actual
   */
  async getCurrentProfile(): Promise<User | null> {
    return this.getCurrentUser();
  },
};
