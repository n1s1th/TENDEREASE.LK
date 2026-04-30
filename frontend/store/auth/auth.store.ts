// ─── Auth Store ─────────────────────────────────────────────
// persist → survives page refresh  |  devtools → Redux DevTools support
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { AuthState } from "@/lib/types/auth.types";
import { apiLogin, apiLogout } from "@/lib/api/auth.api";

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // ── State ──────────────────────────────────
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,

        // ── Actions ────────────────────────────────
        login: async (email, password) => {
          set({ isLoading: true }, false, "auth/login/pending");
          try {
            const { user, token } = await apiLogin({ email, password });
            set(
              { user, token, isAuthenticated: true, isLoading: false },
              false,
              "auth/login/fulfilled"
            );
          } catch (err) {
            set({ isLoading: false }, false, "auth/login/rejected");
            throw err;
          }
        },

        logout: async () => {
          const token = get().token;
          if (token) {
            try { await apiLogout(token); } catch { /* ignore */ }
          }
          set(
            { user: null, token: null, isAuthenticated: false },
            false,
            "auth/logout"
          );
        },

        setUser: (user) => set({ user }, false, "auth/setUser"),
        setToken: (token) =>
          set({ token, isAuthenticated: true }, false, "auth/setToken"),
      }),
      {
        name: "auth-storage", // key in localStorage
        partialize: (state) => ({
          // only persist these fields — never persist loading state
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: "AuthStore" }
  )
);

// ── Selectors (use these to avoid unnecessary re-renders) ──
export const selectUser = (s: AuthState) => s.user;
export const selectToken = (s: AuthState) => s.token;
export const selectIsAuthenticated = (s: AuthState) => s.isAuthenticated;
export const selectAuthLoading = (s: AuthState) => s.isLoading;
