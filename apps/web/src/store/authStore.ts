import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "HR" | "EMPLOYEE";
  organizationId?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  switchOrg: (user: User, token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        console.log("🔐 Auth: setAuth called", {
          userId: user.id,
          tokenLength: token.length,
          tokenPreview: token.substring(0, 20) + "...",
        });
        set({ user, token });
      },
      logout: () => {
        console.log("🔐 Auth: logout called");
        set({ user: null, token: null });
      },
      switchOrg: (user, token) => {
        console.log("🔄 Auth: switchOrg called", {
          newOrgId: user.organizationId,
          tokenPreview: token.substring(0, 20) + "...",
        });
        set({ user, token });
      },
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log("🔐 Auth: Hydrated from storage", {
            hasUser: !!state.user,
            hasToken: !!state.token,
            tokenLength: state.token?.length ?? 0,
          });
        }
      },
    },
  ),
);
