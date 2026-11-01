/**
 * AuthContext - JWT Authentication State Management
 * Provides login, logout, user state, and token management
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      if (api.isAuthenticated()) {
        try {
          const profile = await api.getProfile();
          setUser(profile.user);
        } catch (e) {
          // Token might be expired, try refresh
          try {
            await api.refreshAccessToken();
            const profile = await api.getProfile();
            setUser(profile.user);
          } catch (refreshError) {
            api.clearTokens();
            setUser(null);
          }
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const result = await api.login(email, password);
      setUser(result.user);
      return result;
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }, []);

  const register = useCallback(async (data) => {
    setError(null);
    try {
      const result = await api.register(data);
      setUser(result.user);
      return result;
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }, []);

  const logout = useCallback(() => {
    api.logout();
    setUser(null);
  }, []);

  const updateUser = useCallback((userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  }, []);

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isClinician: user?.role === 'CLINICIAN',
    isCaregiver: user?.role === 'CAREGIVER',
    isPatient: user?.role === 'PATIENT',
  };

  return (
    <AuthContext.Provider value={value}>
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