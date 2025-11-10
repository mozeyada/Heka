// Arguments store for managing arguments state

import { create } from 'zustand';
import { argumentsAPI } from '@/lib/api';

interface Argument {
  id: string;
  couple_id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  summary?: string;
  created_at: string;
  updated_at: string;
}

interface ArgumentsState {
  arguments: Argument[];
  currentArgument: Argument | null;
  isLoading: boolean;
  
  createArgument: (data: { title: string; category: string; priority?: string }) => Promise<void>;
  fetchArguments: () => Promise<void>;
  fetchArgumentById: (id: string) => Promise<void>;
  clearCurrentArgument: () => void;
}

export const useArgumentsStore = create<ArgumentsState>((set) => ({
  arguments: [],
  currentArgument: null,
  isLoading: false,

  createArgument: async (data) => {
    set({ isLoading: true });
    try {
      const newArgument = await argumentsAPI.create(data);
      set((state) => ({
        arguments: [newArgument, ...state.arguments],
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchArguments: async () => {
    set({ isLoading: true });
    try {
      const args = await argumentsAPI.getAll();
      set({ arguments: args, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchArgumentById: async (id: string) => {
    set({ isLoading: true });
    try {
      const argument = await argumentsAPI.getById(id);
      set({ currentArgument: argument, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  clearCurrentArgument: () => {
    set({ currentArgument: null });
  },
}));

