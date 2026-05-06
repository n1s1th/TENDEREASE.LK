import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

export interface User {
  id: string;
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  roles: string[];
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  isLoading: boolean;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        isAuthenticated: false,
        token: null,
        user: null,
        isLoading: false,
        setAuth: (token, user) => set({ isAuthenticated: true, token, user, isLoading: false }, false, "auth/setAuth"),
        clearAuth: () => set({ isAuthenticated: false, token: null, user: null, isLoading: false }, false, "auth/clearAuth"),
      }),
      {
        name: 'tenderease-auth',
      }
    ),
    { name: "AuthStore" }
  )
);

// ── Selectors ──
export const selectUser = (s: AuthState) => s.user;
export const selectToken = (s: AuthState) => s.token;
export const selectIsAuthenticated = (s: AuthState) => s.isAuthenticated;
export const selectAuthLoading = (s: AuthState) => s.isLoading;
