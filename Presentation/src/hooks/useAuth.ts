import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type { User, AuthResponse, LoginRequest, SignUpRequest, AppRole } from '@/types/api';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      api.setAuthToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // Invalid stored user, clear storage
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    setLoading(false);
  }, []);

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (!storedToken) return;

      try {
        const currentUser = await api.get<User>('/api/users/me');
        setUser(currentUser);
        localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
      } catch {
        // Token invalid, clear storage
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        api.setAuthToken(null);
        setUser(null);
      }
    };

    validateToken();
  }, []);

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
      return { error: error as Error };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await api.post('/api/auth/logout', {});
    } catch {
      // Ignore logout errors
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      api.setAuthToken(null);
      setUser(null);
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

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    refreshUser,
    roles,
    isAdmin,
    isManager,
    isEmployee,
    isAuthenticated: !!user,
  };
}
