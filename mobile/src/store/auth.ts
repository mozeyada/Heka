import { create, StateCreator } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';
import { api, setAuthToken } from '../api/client';
import { identifyUser, trackEvent } from '../services/analytics';
import { getDeviceId } from '../services/deviceId';
import { registerForPushNotifications, unregisterPushNotifications } from '../services/notifications';

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  email: string | null;
  userId: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string, deviceId?: string) => Promise<void>;
  refreshSession: (deviceId?: string) => Promise<void>;
  logout: () => void;
};

type LoginResponse = {
  access_token: string;
  refresh_token?: string;
  email: string;
  user_id: string;
};

type RefreshPayload = {
  refresh_token: string;
  device_id?: string;
};

type AuthStore = AuthState;

type AuthPersistedState = Pick<AuthStore, 'accessToken' | 'refreshToken' | 'email' | 'userId'>;

type AuthPersist = PersistOptions<AuthStore, AuthPersistedState>;

const createAuthStore: StateCreator<AuthStore> = (set, get) => ({
  accessToken: null,
  refreshToken: null,
  email: null,
  userId: null,
  loading: false,
  error: null,
  login: async (email, password, deviceId) => {
    set({ loading: true, error: null });
    try {
      const resolvedDeviceId = deviceId ?? (await getDeviceId());
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await api.post<LoginResponse>('/api/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          ...(resolvedDeviceId ? { 'x-device-id': resolvedDeviceId } : {}),
        },
      });

      setAuthToken(response.data.access_token);
      set({
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token ?? null,
        email: response.data.email,
        userId: response.data.user_id,
        loading: false,
      });

      await identifyUser(response.data.user_id);
      await trackEvent('login_success');
      void registerForPushNotifications();
    } catch (error) {
      const status = (error as { response?: { status?: number; data?: { detail?: string } } }).response?.status;
      const detail =
        (error as { response?: { data?: { detail?: string } } }).response?.data?.detail ?? 'Login failed';
      set({
        loading: false,
        error: detail,
      });
      await trackEvent('login_failure', {
        status,
      });
      throw error;
    }
  },
  refreshSession: async (deviceId) => {
    const { refreshToken, userId } = get();
    if (!refreshToken) {
      setAuthToken(null);
      set({
        accessToken: null,
        refreshToken: null,
        email: null,
        userId: null,
      });
      return;
    }

    try {
      const resolvedDeviceId = deviceId ?? (await getDeviceId());
      const payload: RefreshPayload = {
        refresh_token: refreshToken,
        device_id: resolvedDeviceId,
      };
      const response = await api.post<LoginResponse>('/api/auth/refresh', payload);

      setAuthToken(response.data.access_token);
      set({
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token ?? refreshToken,
        email: response.data.email,
        userId: response.data.user_id,
      });

      await identifyUser(response.data.user_id);
      await trackEvent('refresh_success');
    } catch (error) {
      setAuthToken(null);
      set({
        accessToken: null,
        refreshToken: null,
        email: null,
        userId: null,
      });
      if (userId) {
        await identifyUser(userId);
      }
      await trackEvent('refresh_failure');
    }
  },
  logout: () => {
    setAuthToken(null);
    set({
      accessToken: null,
      refreshToken: null,
      email: null,
      userId: null,
      loading: false,
      error: null,
    });
    void trackEvent('logout');
    void unregisterPushNotifications();
  },
});

const persistOptions: AuthPersist = {
  name: 'heka-auth-store',
  partialize: (state) => ({
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
    email: state.email,
    userId: state.userId,
  }),
  onRehydrateStorage: () => (state) => {
    if (state?.accessToken) {
      setAuthToken(state.accessToken);
    }
  },
};

export const useAuthStore = create<AuthStore>()(persist(createAuthStore, persistOptions));


