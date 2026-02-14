import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../interfaces';
import { authService } from '../services';

interface AuthContextType {
  profile: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string, phone: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = profile?.role === 'admin';

  // Inicializar - cargar usuario de localStorage
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setProfile(currentUser);
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    const { user, error } = await authService.signIn({ email, password });
    if (user) {
      setProfile(user);
    }
    return { error };
  };

  const signUp = async (email: string, password: string, name: string, phone: string) => {
    const { user, error } = await authService.signUp({ email, password, name, phone });
    if (user) {
      setProfile(user);
    }
    return { error };
  };

  const signOut = async () => {
    await authService.signOut();
    setProfile(null);
  };

  const refreshProfile = () => {
    const currentUser = authService.getCurrentUser();
    setProfile(currentUser);
  };

  const value: AuthContextType = {
    profile,
    isLoading,
    isAdmin,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
