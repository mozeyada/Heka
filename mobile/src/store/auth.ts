import * as SecureStore from "expo-secure-store";
import { create, StateCreator } from "zustand";
import { persist, PersistOptions, createJSONStorage } from "zustand/middleware";

import { api, setAuthToken } from "../api/client";
import { identifyUser, trackEvent } from "../services/analytics";
import { getDeviceId } from "../services/deviceId";
import {
  registerForPushNotifications,
  unregisterPushNotifications,
} from "../services/notifications";

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  email: string | null;
  userId: string | null;
  loading: boolean;
  error: string | null;
  _hasHydrated: boolean;
  // Computed properties
  isAuthenticated: boolean;
  user: { id: string; email: string; name?: string } | null;
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

type AuthPersistedState = Pick<
  AuthStore,
  "accessToken" | "refreshToken" | "email" | "userId"
>;

type AuthPersist = PersistOptions<AuthStore, AuthPersistedState>;

const createAuthStore: StateCreator<AuthStore> = (set, get) => ({
  accessToken: null,
  refreshToken: null,
  email: null,
  userId: null,
  loading: false,
  error: null,
  // Computed properties - updated when accessToken/userId/email change
  isAuthenticated: false,
  user: null,
  _hasHydrated: false,
  login: async (email, password, deviceId) => {
    set({ loading: true, error: null });
    try {
      const resolvedDeviceId = deviceId ?? (await getDeviceId());
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const response = await api.post<LoginResponse>(
        "/api/auth/login",
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            ...(resolvedDeviceId ? { "x-device-id": resolvedDeviceId } : {}),
          },
        },
      );

      const token = response.data.access_token;
      const refreshToken = response.data.refresh_token ?? null;

      // CRITICAL: Set auth token FIRST before updating store
      // This ensures the API client has the token before any navigation happens
      setAuthToken(token);

      // CRITICAL: Update store state synchronously
      // This must happen before any async operations to ensure navigation guard sees the token
      set({
        accessToken: token,
        refreshToken,
        email: response.data.email,
        userId: response.data.user_id,
        loading: false,
        isAuthenticated: !!token,
        user:
          response.data.user_id && response.data.email
            ? { id: response.data.user_id, email: response.data.email } // Backend doesn't return name on login yet, will rely on profile fetch or fallback
            : null,
      });

      await identifyUser(response.data.user_id);
      await trackEvent("login_success");
      void registerForPushNotifications();
    } catch (error) {
      const status = (
        error as { response?: { status?: number; data?: { detail?: string } } }
      ).response?.status;
      const detail =
        (error as { response?: { data?: { detail?: string } } }).response?.data
          ?.detail ?? "Login failed";
      set({
        loading: false,
        error: detail,
      });
      await trackEvent("login_failure", {
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

      const response = await api.post<LoginResponse>(
        "/api/auth/refresh",
        payload,
      );

      const newAccessToken = response.data.access_token;
      const newRefreshToken = response.data.refresh_token ?? refreshToken;

      setAuthToken(newAccessToken);
      set({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        email: response.data.email,
        userId: response.data.user_id,
        isAuthenticated: !!newAccessToken,
        user:
          response.data.user_id && response.data.email
            ? {
              id: response.data.user_id,
              email: response.data.email,
              ...get().user, // Preserve existing user data like name
            }
            : null,
      });

      await identifyUser(response.data.user_id);
      await trackEvent("refresh_success");
    } catch (error) {
      setAuthToken(null);
      set({
        accessToken: null,
        refreshToken: null,
        email: null,
        userId: null,
        isAuthenticated: false,
        user: null,
      });
      if (userId) {
        await identifyUser(userId);
      }
      await trackEvent("refresh_failure");
      throw error; // Re-throw so interceptor can handle it
    }
  },
  logout: () => {
    // Clear API token first
    setAuthToken(null);

    // Clear store state
    set({
      accessToken: null,
      refreshToken: null,
      email: null,
      userId: null,
      loading: false,
      error: null,
      isAuthenticated: false,
      user: null,
    });

    void trackEvent("logout");
    void unregisterPushNotifications();
  },
});

const persistOptions: AuthPersist = {
  name: "heka-auth-store",
  storage: {
    getItem: async (name) => {
      try {
        const str = await SecureStore.getItemAsync(name);
        return str ? JSON.parse(str) : null;
      } catch (e) {
        return null;
      }
    },
    setItem: async (name, value) => {
      try {
        await SecureStore.setItemAsync(name, JSON.stringify(value));
      } catch (e) {}
    },
    removeItem: async (name) => {
      try {
        await SecureStore.deleteItemAsync(name);
      } catch (e) {}
    },
  },
  partialize: (state) => ({
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
    email: state.email,
    userId: state.userId,
  }),
  onRehydrateStorage: () => (state, error) => {
    if (error) {
      useAuthStore.setState({ _hasHydrated: true });
      return;
    }
    if (state?.accessToken) {
      setAuthToken(state.accessToken);
    }
    useAuthStore.setState({ _hasHydrated: true });
  },
};

export const useAuthStore = create<AuthStore>()(
  persist(createAuthStore, persistOptions),
);

