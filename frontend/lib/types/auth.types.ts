// ─── Auth Types ────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "vendor" | "evaluator" | "department";
  avatarUrl?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
}
