import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { api } from '@/lib/api';
import type { User, AuthResponse, LoginRequest, SignUpRequest, AppRole } from '@/types/api';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

interface AuthContextType {
  user: User | null;
  profile: User | null; // Alias for backwards compatibility
  roles: AppRole[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
  isManager: boolean;
  isEmployee: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedToken && storedUser) {
          api.setAuthToken(storedToken);
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);

            // Validate token in background
            validateToken();
          } catch {
            // Invalid stored user, clear storage
            clearAuth();
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const clearAuth = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    api.setAuthToken(null);
    setUser(null);
  };

  const validateToken = async () => {
    try {
      const currentUser = await api.get<User>('/api/users/me');
      setUser(currentUser);
      localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
    } catch {
      // Token invalid, clear storage
      clearAuth();
    }
  };

  const signIn = useCallback(async (email: string, password: string): Promise<{ error: Error | null }> => {
    try {
      const response = await api.post<AuthResponse>('/api/auth/login', { email, password } as LoginRequest, {
        requiresAuth: false,
      });

      api.setAuthToken(response.access_token);
      localStorage.setItem(TOKEN_KEY, response.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
      setUser(response.user);

      return { error: null };
    } catch (error) {
      console.error('Login error:', error);
      return { error: error as Error };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string): Promise<{ error: Error | null }> => {
    try {
      const response = await api.post<AuthResponse>('/api/auth/register', {
        email,
        password,
        full_name: fullName,
      } as SignUpRequest, {
        requiresAuth: false,
      });

      api.setAuthToken(response.access_token);
      localStorage.setItem(TOKEN_KEY, response.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
      setUser(response.user);

      return { error: null };
    } catch (error) {
      console.error('Signup error:', error);
      return { error: error as Error };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await api.post('/api/auth/logout', {});
    } catch {
      // Ignore logout errors
    } finally {
      clearAuth();
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await api.get<User>('/api/users/me');
      setUser(currentUser);
      localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
    } catch {
      // If refresh fails, user may have been logged out
    }
  }, []);

  // Role helpers
  const roles: AppRole[] = user?.roles || [];
  const isAdmin = roles.includes('admin');
  const isManager = roles.includes('manager');
  const isEmployee = roles.includes('employee') || roles.length === 0;

  const value: AuthContextType = {
    user,
    profile: user, // Backwards compatibility alias
    roles,
    loading,
    signIn,
    signUp,
    signOut,
    refreshUser,
    isAdmin,
    isManager,
    isEmployee,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}