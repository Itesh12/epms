import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  role: string;
  orgId: string;
  firstName?: string;
  lastName?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setAuth: (user, accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        // Set cookie for middleware to see
        document.cookie = `accessToken=${accessToken}; path=/; max-age=2592000; SameSite=Lax`;
        set({ user, accessToken, refreshToken });
      },
      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        // Clear cookie
        document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        set({ user: null, accessToken: null, refreshToken: null });
      },
    }),
    {
      name: 'auth-storage',
    },
  ),
);
