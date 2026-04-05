import { create } from 'zustand';
import { type InAppNotification, notificationsAPI } from '@/lib/api';

interface NotificationsState {
  unreadCount: number;
  lastFetchedAt: number | null;
  fetchUnreadCount: (force?: boolean) => Promise<void>;
  syncFromFeed: (items: InAppNotification[]) => void;
  markNotificationRead: () => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
}

const UNREAD_COUNT_TTL_MS = 60_000;
let unreadCountRequest: Promise<void> | null = null;

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  unreadCount: 0,
  lastFetchedAt: null,

  fetchUnreadCount: async (force = false) => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!localStorage.getItem('access_token')) {
      set({ unreadCount: 0, lastFetchedAt: null });
      return;
    }

    const { lastFetchedAt } = get();
    if (!force && lastFetchedAt && Date.now() - lastFetchedAt < UNREAD_COUNT_TTL_MS) {
      return;
    }

    if (unreadCountRequest) {
      return unreadCountRequest;
    }

    unreadCountRequest = notificationsAPI
      .getUnreadCount()
      .then((data) => {
        set({
          unreadCount: data.unread_count || 0,
          lastFetchedAt: Date.now(),
        });
      })
      .catch(() => {
        set({
          unreadCount: 0,
          lastFetchedAt: Date.now(),
        });
      })
      .finally(() => {
        unreadCountRequest = null;
      });

    return unreadCountRequest;
  },

  syncFromFeed: (items) => {
    set({
      unreadCount: items.filter((item) => !item.is_read).length,
      lastFetchedAt: Date.now(),
    });
  },

  markNotificationRead: () => {
    set((state) => ({
      unreadCount: Math.max(0, state.unreadCount - 1),
      lastFetchedAt: Date.now(),
    }));
  },

  markAllNotificationsRead: () => {
    set({
      unreadCount: 0,
      lastFetchedAt: Date.now(),
    });
  },

  clearNotifications: () => {
    set({
      unreadCount: 0,
      lastFetchedAt: null,
    });
  },
}));
