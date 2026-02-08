import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { User, AppRole } from '@/types/api';

interface ApiAuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  roles: AppRole[];
  isAdmin: boolean;
  isManager: boolean;
  isEmployee: boolean;
  isAuthenticated: boolean;
}

const ApiAuthContext = createContext<ApiAuthContextType | undefined>(undefined);

export function ApiAuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return (
    <ApiAuthContext.Provider value={auth}>
      {children}
    </ApiAuthContext.Provider>
  );
}

export function useApiAuth() {
  const context = useContext(ApiAuthContext);
  if (context === undefined) {
    throw new Error('useApiAuth must be used within an ApiAuthProvider');
  }
  return context;
}
