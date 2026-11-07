import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, LoginCredentials, RegisterCredentials, UserRole } from '@/types/auth';
import { apiClient, setAuthToken } from '@/lib/api-client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  loginWithGoogle: (data: { credential: string; role?: UserRole }) => Promise<void>;
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
    const payload = {
      identifier: credentials.identifier || credentials.email,
      email: credentials.email || credentials.identifier,
      password: credentials.password,
    };
    const data = await apiClient<{ user: User; access_token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (data.access_token) {
      setAuthToken(data.access_token);
    }
    setUser(data.user);
  };

  const register = async (credentials: RegisterCredentials) => {
    const data = await apiClient<{ user: User; access_token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        displayName: credentials.displayName,
        display_name: credentials.displayName,
        email: credentials.email,
        password: credentials.password,
        role: credentials.role || 'candidate',
      }),
    });

    if (data.access_token) {
      setAuthToken(data.access_token);
    }
    setUser(data.user);
  };

  const loginWithGoogle = async (data: { credential: string; role?: UserRole }) => {
    const res = await apiClient<{ user: User; access_token: string }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential: data.credential, role: data.role || 'candidate' }),
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
