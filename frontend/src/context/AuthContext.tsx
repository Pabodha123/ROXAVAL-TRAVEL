import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiGetOne, apiPatch, apiPost } from '../lib/api';

export interface AuthUser {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin' | 'superadmin';
  avatar?: string;
}

interface LoginResponse {
  user: AuthUser;
  accessToken: string;
}

interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  country?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<AuthUser>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    try {
      const { user: me } = await apiGetOne<{ user: AuthUser }>('/auth/me');
      setUser(me);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshMe().finally(() => setLoading(false));
  }, [refreshMe]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiPost<LoginResponse>('/auth/login', { email, password });
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const res = await apiPost<LoginResponse>('/auth/register', payload);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(async () => {
    await apiPost('/auth/logout').catch(() => {});
    setUser(null);
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    await apiPost('/auth/forgot-password', { email });
  }, []);

  const resetPassword = useCallback(async (token: string, password: string) => {
    await apiPatch<{ accessToken: string }>(`/auth/reset-password/${token}`, { password });
    const { user: me } = await apiGetOne<{ user: AuthUser }>('/auth/me');
    setUser(me);
    return me;
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    await apiPatch('/auth/update-password', { currentPassword, newPassword });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, forgotPassword, resetPassword, changePassword, refreshMe }}>
      {children}
    </AuthContext.Provider>);

}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
