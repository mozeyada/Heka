// Auth store for managing authentication state

import { create } from 'zustand';
import { authAPI } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  age: number;
  is_active: boolean;
  created_at: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; age: number; accept_terms: boolean; accept_privacy: boolean }) => Promise<void>;
  logout: () => void;
  fetchCurrentUser: () => Promise<void>;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      await authAPI.login(email, password);
      await get().fetchCurrentUser();
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      // Register user
      await authAPI.register(data);
      
      // Try to auto-login after registration
      try {
        await authAPI.login(data.email, data.password);
        await get().fetchCurrentUser();
        set({ isLoading: false });
        // Success - user is now logged in
      } catch (loginError: any) {
        // Registration succeeded but login failed
        set({ isLoading: false });
        // Check if it's a password verification issue
        const loginErrorMsg = loginError.response?.data?.detail || loginError.message;
        if (loginErrorMsg.includes('Incorrect email or password')) {
          throw new Error('Account created but login failed. Please try logging in manually.');
        }
        throw new Error(`Account created successfully. Login error: ${loginErrorMsg}`);
      }
    } catch (error: any) {
      set({ isLoading: false });
      // Re-throw with proper error message
      if (error.message) {
        throw error; // Already has a good message
      }
      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.detail || 'Registration failed. Please check your information.');
      }
      throw new Error(error.message || 'Registration failed. Please try again.');
    }
  },

  logout: () => {
    authAPI.logout();
    set({ user: null, isAuthenticated: false });
  },

  fetchCurrentUser: async () => {
    if (!authAPI.isAuthenticated()) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      set({ isLoading: true });
      const user = await authAPI.getCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      authAPI.logout();
    }
  },

  checkAuth: () => {
    const isAuth = authAPI.isAuthenticated();
    set({ isAuthenticated: isAuth });
    if (isAuth) {
      get().fetchCurrentUser();
    }
  },
}));

