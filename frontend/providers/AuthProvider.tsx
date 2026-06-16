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
      const kc = keycloak;
      if (!kc) return;
      isInitializing.current = true;
      console.log('🔄 Initializing Keycloak...');
      
      try {
        const authenticated = await kc.init({
          // Removed onLoad: 'check-sso' to prevent CSP and 400 errors
          // Users will now need to click "Sign In" to authenticate
          pkceMethod: 'S256',
          checkLoginIframe: false,
        });

        console.log('✅ Keycloak initialized. Authenticated:', authenticated);

        if (authenticated) {
          const token = kc.token!;
          const decoded: any = jwtDecode(token);
          
          setAuth(token, {
            id: decoded.sub,
            email: decoded.email,
            name: decoded.name,
            firstName: decoded.given_name,
            lastName: decoded.family_name,
            username: decoded.preferred_username,
            roles: decoded.realm_access?.roles || [],
          });

          // Token refresh logic
          kc.onTokenExpired = () => {
            console.log('⏳ Token expired, refreshing...');
            kc.updateToken(70).then((refreshed) => {
              if (refreshed) {
                console.log('🔄 Token refreshed successfully');
                const newToken = kc.token!;
                const newDecoded: any = jwtDecode(newToken);
                setAuth(newToken, {
                  id: newDecoded.sub,
                  email: newDecoded.email,
                  name: newDecoded.name,
                  firstName: newDecoded.given_name,
                  lastName: newDecoded.family_name,
                  username: newDecoded.preferred_username,
                  roles: newDecoded.realm_access?.roles || [],
                });
              }
            }).catch(err => {
              console.error('❌ Failed to refresh token', err);
              clearAuth();
            });
          };
        } else {
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.has('code') || urlParams.has('error') || urlParams.has('state')) {
            clearAuth();
          }
        }
        setInitialized(true);
      } catch (error: any) {
        console.error('❌ Keycloak initialization failed:', error);
        setError(error?.message || 'Failed to connect to authentication server');
        setInitialized(true); // Still set to true to unblock the app, but with error
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
