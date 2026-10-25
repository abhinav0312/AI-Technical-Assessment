import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, LoginCredentials, RegisterCredentials, UserRole } from '@/types/auth';
import { apiClient, setAuthToken } from '@/lib/api-client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  loginWithGoogle: (data?: { credential?: string; email?: string; displayName?: string; role?: UserRole }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const data = await apiClient<{ user: User }>('/auth/me');
      setUser(data.user);
    } catch {
      setUser(null);
      setAuthToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (credentials: LoginCredentials) => {
    const data = await apiClient<{ user: User; access_token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (data.access_token) {
      setAuthToken(data.access_token);
    }
    setUser(data.user);
  };

  const register = async (credentials: RegisterCredentials) => {
    const data = await apiClient<{ user: User; access_token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (data.access_token) {
      setAuthToken(data.access_token);
    }
    setUser(data.user);
  };

  const loginWithGoogle = async (data?: { credential?: string; email?: string; displayName?: string; role?: UserRole }) => {
    const payload = {
      credential: data?.credential,
      email: data?.email || 'google.developer@devmind.ai',
      display_name: data?.displayName || 'Google Engineer',
      role: data?.role || 'candidate',
    };

    const res = await apiClient<{ user: User; access_token: string }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.access_token) {
      setAuthToken(res.access_token);
    }
    setUser(res.user);
  };

  const logout = async () => {
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    } finally {
      setAuthToken(null);
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const data = await apiClient<{ user: User }>('/auth/me');
      setUser(data.user);
    } catch {
      // Maintain existing state if refresh fails temporarily
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        loginWithGoogle,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
