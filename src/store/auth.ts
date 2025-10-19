import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Role = 'SUPER_ADMIN' | 'SECRETARY' | null;

interface AuthState {
  token: string | null;
  role: Role;
  user: any | null;
  setAuth: (token: string, role: Role, user: any) => void;
  updateUser: (user: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(persist(
  (set) => ({
    token: null,
    role: null,
    user: null,
    setAuth: (token, role, user) => set({ token, role, user }),
    updateUser: (user) => set((state) => ({ ...state, user })),
    logout: () => set({ token: null, role: null, user: null }),
  }),
  { name: 'auth' }
));
