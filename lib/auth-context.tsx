'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, getSession, login as storeLogin, register as storeRegister, logout as storeLogout, updateProfile } from '@/lib/store';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    setUser(session);
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const u = storeLogin(email, password);
    setUser(u);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    storeRegister(name, email, password);
    const u = storeLogin(email, password);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    storeLogout();
    setUser(null);
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    updateProfile(updates);
    setUser(prev => prev ? { ...prev, ...updates } : prev);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
