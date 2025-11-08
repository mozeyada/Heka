// Couples store for managing couple state

import { create } from 'zustand';
import { couplesAPI } from '@/lib/api';

interface Couple {
  id: string;
  user1_id: string;
  user2_id: string;
  status: string;
  created_at: string;
}

interface CouplesState {
  couple: Couple | null;
  isLoading: boolean;
  
  createCouple: (partnerEmail: string) => Promise<void>;
  fetchMyCouple: () => Promise<void>;
  clearCouple: () => void;
}

export const useCouplesStore = create<CouplesState>((set) => ({
  couple: null,
  isLoading: false,

  createCouple: async (partnerEmail: string) => {
    set({ isLoading: true });
    try {
      const couple = await couplesAPI.create(partnerEmail);
      set({ couple, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchMyCouple: async () => {
    set({ isLoading: true });
    try {
      const couple = await couplesAPI.getMyCouple();
      set({ couple, isLoading: false });
    } catch (error: any) {
      if (error.response?.status === 404) {
        // No couple found - this is OK
        set({ couple: null, isLoading: false });
      } else {
        set({ isLoading: false });
        throw error;
      }
    }
  },

  clearCouple: () => {
    set({ couple: null });
  },
}));

