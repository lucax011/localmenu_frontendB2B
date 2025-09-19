import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthState = {
  token: string | null;
  businessId: string | null;
  setAuth: (token: string, businessId: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      businessId: null,
      setAuth: (token, businessId) => set({ token, businessId }),
      logout: () => set({ token: null, businessId: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => ({
        getItem: (key: string) => AsyncStorage.getItem(key),
        setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
        removeItem: (key: string) => AsyncStorage.removeItem(key),
      })),
      partialize: (s: AuthState) => ({ token: s.token, businessId: s.businessId }),
    }
  )
);
