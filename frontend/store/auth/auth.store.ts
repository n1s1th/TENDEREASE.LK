import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

export type OfficerRegStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | null;

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
  refreshToken: string | null;
  user: User | null;
  isLoading: boolean;
  officerRegistrationStatus: OfficerRegStatus;
  officerRegistrationId: string | null;
  setAuth: (token: string, user: User, refreshToken?: string) => void;
  clearAuth: () => void;
  setOfficerRegistration: (status: OfficerRegStatus, id?: string | null) => void;
  clearOfficerRegistration: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        isAuthenticated: false,
        token: null,
        refreshToken: null,
        user: null,
        isLoading: false,
        officerRegistrationStatus: null,
        officerRegistrationId: null,
        setAuth: (token, user, refreshToken) => set({ isAuthenticated: true, token, refreshToken: refreshToken ?? null, user, isLoading: false }, false, "auth/setAuth"),
        clearAuth: () => set({ isAuthenticated: false, token: null, refreshToken: null, user: null, isLoading: false, officerRegistrationStatus: null, officerRegistrationId: null }, false, "auth/clearAuth"),
        setOfficerRegistration: (status, id) => set({ officerRegistrationStatus: status, officerRegistrationId: id ?? null }, false, "auth/setOfficerRegistration"),
        clearOfficerRegistration: () => set({ officerRegistrationStatus: null, officerRegistrationId: null }, false, "auth/clearOfficerRegistration"),
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
export const selectOfficerRegistrationStatus = (s: AuthState) => s.officerRegistrationStatus;

