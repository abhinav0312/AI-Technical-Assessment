import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, LoginCredentials, RegisterCredentials, UserRole } from '@/types/auth';
import { apiClient, setAuthToken } from '@/lib/api-client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  resetPassword: (email: string, newPassword: string) => Promise<void>;
  sendOtp: (data: {
    email: string;
    purpose: 'signup' | 'password_reset';
    displayName?: string;
    password?: string;
    role?: UserRole;
  }) => Promise<{ message: string; dev_code?: string }>;
  verifyOtp: (data: {
    email: string;
    code: string;
    purpose: 'signup' | 'password_reset';
    newPassword?: string;
  }) => Promise<void>;
  loginWithGoogle: (data: { credential: string; role?: UserRole }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_CACHE_KEY = 'devmind_user_profile';

function getInitialUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(getInitialUser);
  const [isLoading, setIsLoading] = useState<boolean>(!getInitialUser());

  const saveUser = (newUser: User | null) => {
    setUser(newUser);
    if (typeof window !== 'undefined') {
      if (newUser) {
        localStorage.setItem(USER_CACHE_KEY, JSON.stringify(newUser));
      } else {
        localStorage.removeItem(USER_CACHE_KEY);
      }
    }
  };

  const fetchCurrentUser = useCallback(async () => {
    try {
      const data = await apiClient<{ user: User }>('/auth/me');
      saveUser(data.user);
    } catch {
      saveUser(null);
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
    saveUser(data.user);
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
    saveUser(data.user);
  };

  const resetPassword = async (email: string, newPassword: string) => {
    const data = await apiClient<{ user: User; access_token: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim(), new_password: newPassword }),
    });

    if (data.access_token) {
      setAuthToken(data.access_token);
    }
    saveUser(data.user);
  };

  const sendOtp = async (data: {
    email: string;
    purpose: 'signup' | 'password_reset';
    displayName?: string;
    password?: string;
    role?: UserRole;
  }) => {
    return await apiClient<{ message: string; email: string; purpose: string; dev_code?: string }>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({
        email: data.email.trim().toLowerCase(),
        purpose: data.purpose,
        display_name: data.displayName,
        password: data.password,
        role: data.role || 'candidate',
      }),
    });
  };

  const verifyOtp = async (data: {
    email: string;
    code: string;
    purpose: 'signup' | 'password_reset';
    newPassword?: string;
  }) => {
    const res = await apiClient<{ user: User; access_token: string }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({
        email: data.email.trim().toLowerCase(),
        code: data.code.trim(),
        purpose: data.purpose,
        new_password: data.newPassword,
      }),
    });

    if (res.access_token) {
      setAuthToken(res.access_token);
    }
    saveUser(res.user);
  };

  const loginWithGoogle = async (data: { credential: string; role?: UserRole }) => {
    const res = await apiClient<{ user: User; access_token: string }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential: data.credential, role: data.role || 'candidate' }),
    });

    if (res.access_token) {
      setAuthToken(res.access_token);
    }
    saveUser(res.user);
  };

  const logout = async () => {
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    } finally {
      setAuthToken(null);
      saveUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const data = await apiClient<{ user: User }>('/auth/me');
      saveUser(data.user);
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
        resetPassword,
        sendOtp,
        verifyOtp,
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
