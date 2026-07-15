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
    if (!keycloak || isInitializing.current || initialized) return;

    const initKeycloak = async () => {
      isInitializing.current = true;

      // Restore previously stored tokens so Keycloak can re-authenticate silently
      // without a redirect on every page load/refresh.
      const stored = useAuthStore.getState();

      try {
        let authenticated = false;
        try {
          authenticated = await keycloak.init({
            pkceMethod: 'S256',
            checkLoginIframe: false,
            token: stored.token ?? undefined,
            refreshToken: stored.refreshToken ?? undefined,
          });
        } catch (initErr) {
          console.warn('⚠️ Keycloak token-based init failed, retrying clean init:', initErr);
          clearAuth();
          authenticated = await keycloak.init({
            pkceMethod: 'S256',
            checkLoginIframe: false,
          });
        }

        const applyAuth = (token: string) => {
          const decoded: any = jwtDecode(token);
          setAuth(
            token,
            {
              id: decoded.sub,
              email: decoded.email,
              name: decoded.name,
              firstName: decoded.given_name,
              lastName: decoded.family_name,
              username: decoded.preferred_username,
              roles: decoded.realm_access?.roles || [],
            },
            keycloak.refreshToken,
          );
        };

        if (authenticated) {
          applyAuth(keycloak.token!);

          keycloak.onTokenExpired = () => {
            keycloak.updateToken(70).then((refreshed) => {
              if (refreshed) applyAuth(keycloak.token!);
            }).catch(() => clearAuth());
          };
        } else {
          clearAuth();
        }
        setInitialized(true);
      } catch (error: any) {
        console.error('❌ Keycloak initialization failed:', error);
        setError(error?.message || 'Failed to connect to authentication server');
        setInitialized(true);
      } finally {
        isInitializing.current = false;
      }
    };

    initKeycloak();
  }, [setAuth, clearAuth, initialized]);

  return (
    <AuthContext.Provider value={{ initialized, error }}>
      {children}
    </AuthContext.Provider>
  );
};
