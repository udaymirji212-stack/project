import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, TokenResponse } from '../types/auth';
import { apiClient } from '../services/api';
import { authApi } from '../services/authApi';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentialsOrTokens: TokenResponse | { email: string; password: string }) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const profile = await authApi.getCurrentUser();
      setUser(profile);
    } catch {
      apiClient.clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (credentialsOrTokens: TokenResponse | { email: string; password: string }) => {
    setIsLoading(true);
    try {
      if ('access_token' in credentialsOrTokens) {
        apiClient.setTokens(credentialsOrTokens.access_token, credentialsOrTokens.refresh_token);
      } else {
        const res = await authApi.login({
          email: credentialsOrTokens.email,
          password: credentialsOrTokens.password,
        });
        apiClient.setTokens(res.access_token, res.refresh_token);
      }
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (fullName: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.register({
        full_name: fullName,
        email,
        password,
        confirm_password: password,
      });
      apiClient.setTokens(res.access_token, res.refresh_token);
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async () => {
    setIsLoading(true);
    try {
      try {
        await login({ email: 'demo@buildmind.ai', password: 'Password123!' });
      } catch {
        await register('Demo Engineer', 'demo@buildmind.ai', 'Password123!');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // Ignore logout errors
      }
    }
    apiClient.clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        demoLogin,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
