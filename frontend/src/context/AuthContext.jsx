/**
 * AuthContext.jsx
 * Role-based authentication for SAFE CAP+
 * Two roles: 'admin' (pharmacist/doctor) and 'user' (patient/caregiver)
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const ROLES = {
  ADMIN: 'admin',
  USER: 'user'
};

const STORAGE_KEY = 'safecap_auth';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed);
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback((role, userData = {}) => {
    const newUser = {
      role,
      name: userData.name || (role === ROLES.ADMIN ? 'Pharmacist' : 'Patient'),
      email: userData.email,
      loggedInAt: new Date().toISOString(),
      ...userData
    };
    setUser(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    return newUser;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const switchRole = useCallback((newRole) => {
    if (user) {
      const newUser = { ...user, role: newRole };
      setUser(newUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    }
  }, [user]);

  const isAdmin = user?.role === ROLES.ADMIN;
  const isUser = user?.role === ROLES.USER;
  const isLoggedIn = !!user;

  const value = {
    user,
    loading,
    login,
    logout,
    switchRole,
    isAdmin,
    isUser,
    isLoggedIn,
    ROLES
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

export { ROLES };