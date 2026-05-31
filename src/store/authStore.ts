import { create } from "zustand";

export interface User {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  is_superadmin: boolean;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  session: any | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: any | null) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
}

// Check local storage for persistent demo/mock session
const getInitialUser = (): User | null => {
  const saved = localStorage.getItem("impacto_user");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }
  return null;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getInitialUser(),
  session: localStorage.getItem("impacto_session") ? {} : null,
  isLoading: false,
  setUser: (user) => {
    if (user) {
      localStorage.setItem("impacto_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("impacto_user");
    }
    set({ user });
  },
  setSession: (session) => {
    if (session) {
      localStorage.setItem("impacto_session", "true");
    } else {
      localStorage.removeItem("impacto_session");
    }
    set({ session });
  },
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => {
    localStorage.removeItem("impacto_user");
    localStorage.removeItem("impacto_session");
    localStorage.removeItem("impacto_active_org");
    localStorage.removeItem("impacto_active_member");
    set({ user: null, session: null, isLoading: false });
  },
}));
