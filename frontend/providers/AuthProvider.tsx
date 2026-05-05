'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import keycloak from '@/lib/keycloak';
import { useAuthStore } from '@/store';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  initialized: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({ initialized: false, error: null });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isInitializing = useRef(false);
  
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    // Temporarily disabled Keycloak initialization to bypass redirects
    setInitialized(true);
  }, []);

  return (
    <AuthContext.Provider value={{ initialized, error }}>
      {children}
    </AuthContext.Provider>
  );
};
