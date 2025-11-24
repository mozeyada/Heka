import { create, StateCreator } from 'zustand';
import { persist, PersistOptions, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  _hasHydrated: boolean;
  // Computed properties
  isAuthenticated: boolean;
  user: { id: string; email: string } | null;
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
  // Computed properties - updated when accessToken/userId/email change
  isAuthenticated: false,
  user: null,
  _hasHydrated: false,
  login: async (email, password, deviceId) => {
    set({ loading: true, error: null });
    try {
      const resolvedDeviceId = deviceId ?? (await getDeviceId());
      console.log('🔑 Login: Using device_id:', {
        provided: deviceId,
        resolved: resolvedDeviceId,
        willSendHeader: !!resolvedDeviceId,
      });
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await api.post<LoginResponse>('/api/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          ...(resolvedDeviceId ? { 'x-device-id': resolvedDeviceId } : {}),
        },
      });

      const token = response.data.access_token;
      const refreshToken = response.data.refresh_token ?? null;
      
      console.log('📥 Login response received:', {
        hasAccessToken: !!token,
        hasRefreshToken: !!refreshToken,
        refreshTokenLength: refreshToken?.length ?? 0,
        refreshTokenPreview: refreshToken ? `${refreshToken.substring(0, 20)}...` : 'null',
        email: response.data.email,
        userId: response.data.user_id,
        responseKeys: Object.keys(response.data),
      });
      
      if (!refreshToken) {
        console.error('⚠️ WARNING: Backend did not return refresh_token!');
      }
      
      // CRITICAL: Set auth token FIRST before updating store
      // This ensures the API client has the token before any navigation happens
      setAuthToken(token);
      console.log('💾 Storing tokens in zustand store...');
      
      // Verify the new token is different from any old token
      const oldRefreshToken = get().refreshToken;
      if (oldRefreshToken && oldRefreshToken === refreshToken) {
        console.warn('⚠️ WARNING: New refresh token same as old token - this should not happen');
      }
      console.log('🔄 Token replacement check:', {
        hadOldToken: !!oldRefreshToken,
        oldTokenPreview: oldRefreshToken ? `${oldRefreshToken.substring(0, 20)}...` : 'null',
        newTokenPreview: refreshToken ? `${refreshToken.substring(0, 20)}...` : 'null',
        tokensMatch: oldRefreshToken === refreshToken,
      });

      // CRITICAL: Update store state synchronously
      // This must happen before any async operations to ensure navigation guard sees the token
      set({
        accessToken: token,
        refreshToken: refreshToken,
        email: response.data.email,
        userId: response.data.user_id,
        loading: false,
        isAuthenticated: !!token,
        user: response.data.user_id && response.data.email
          ? { id: response.data.user_id, email: response.data.email }
          : null,
      });
      
      // Verify state was set immediately
      const immediateState = get();
      if (!immediateState.accessToken || !immediateState.refreshToken) {
        console.error('❌ CRITICAL: Tokens not set in store immediately after set() call!');
        throw new Error('Failed to store authentication tokens');
      }
      console.log('✅ Tokens confirmed in store immediately:', {
        hasAccessToken: !!immediateState.accessToken,
        hasRefreshToken: !!immediateState.refreshToken,
      });
      
      // Verify storage
      const stored = useAuthStore.getState();
      console.log('✅ Tokens stored:', {
        hasStoredAccessToken: !!stored.accessToken,
        hasStoredRefreshToken: !!stored.refreshToken,
        storedRefreshTokenPreview: stored.refreshToken ? `${stored.refreshToken.substring(0, 20)}...` : 'null',
      });

      // Give persist middleware time to save (it's async but fire-and-forget)
      // The persist middleware will save automatically, but we log to verify
      setTimeout(() => {
        AsyncStorage.getItem('heka-auth-store').then((stored) => {
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              const storedRefreshToken = parsed?.state?.refreshToken;
              console.log('✅ Persist verification:', {
                storedTokenMatches: storedRefreshToken === refreshToken,
                storedTokenPreview: storedRefreshToken ? `${storedRefreshToken.substring(0, 20)}...` : 'null',
                expectedTokenPreview: refreshToken ? `${refreshToken.substring(0, 20)}...` : 'null',
              });
            } catch (e) {
              console.error('❌ Failed to parse stored auth state for verification', e);
            }
          }
        }).catch((e) => {
          console.error('❌ Failed to read AsyncStorage for verification', e);
        });
      }, 500);

      await identifyUser(response.data.user_id);
      await trackEvent('login_success');
      void registerForPushNotifications();
      
      // Verify accessToken is set and will trigger navigation
      const finalState = useAuthStore.getState();
      console.log('✅ Login completed - final state:', {
        hasAccessToken: !!finalState.accessToken,
        hasRefreshToken: !!finalState.refreshToken,
        email: finalState.email,
        userId: finalState.userId,
        loading: finalState.loading,
      });
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
    console.log('🔄 refreshSession called', { hasRefreshToken: !!refreshToken, userId });
    
    if (!refreshToken) {
      console.warn('⚠️ No refresh token available');
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
      console.log('🔄 Refresh: Using device_id:', {
        provided: deviceId,
        resolved: resolvedDeviceId,
        willSendInPayload: !!resolvedDeviceId,
      });
      const payload: RefreshPayload = {
        refresh_token: refreshToken,
        device_id: resolvedDeviceId,
      };
      console.log('📤 Calling /api/auth/refresh with payload:', {
        hasRefreshToken: !!payload.refresh_token,
        refreshTokenLength: payload.refresh_token?.length ?? 0,
        refreshTokenPreview: payload.refresh_token ? `${payload.refresh_token.substring(0, 20)}...` : 'null',
        deviceId: payload.device_id,
        payloadKeys: Object.keys(payload),
      });
      
      const response = await api.post<LoginResponse>('/api/auth/refresh', payload);
      console.log('✅ Refresh response received:', { 
        status: response.status,
        hasAccessToken: !!response.data.access_token,
        hasRefreshToken: !!response.data.refresh_token,
        refreshTokenLength: response.data.refresh_token?.length ?? 0,
        responseKeys: Object.keys(response.data),
        userId: response.data.user_id,
        email: response.data.email,
      });

      const newAccessToken = response.data.access_token;
      const newRefreshToken = response.data.refresh_token ?? refreshToken;
      
      setAuthToken(newAccessToken);
      set({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        email: response.data.email,
        userId: response.data.user_id,
        isAuthenticated: !!newAccessToken,
        user: response.data.user_id && response.data.email
          ? { id: response.data.user_id, email: response.data.email }
          : null,
      });

      await identifyUser(response.data.user_id);
      await trackEvent('refresh_success');
      console.log('✅ Token refresh completed successfully');
    } catch (error) {
      console.error('❌ Refresh session error:', error);
      const axiosError = error as { 
        response?: { 
          status?: number; 
          statusText?: string;
          data?: unknown;
          headers?: unknown;
        };
        request?: unknown;
        message?: string;
      };
      const status = axiosError.response?.status;
      const statusText = axiosError.response?.statusText;
      const data = axiosError.response?.data;
      const message = axiosError.message;
      
      console.error('❌ Refresh error details:', { 
        status, 
        statusText,
        message,
        hasResponse: !!axiosError.response,
        hasRequest: !!axiosError.request,
        responseData: data,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
      });
      
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
      await trackEvent('refresh_failure');
      throw error; // Re-throw so interceptor can handle it
    }
  },
  logout: () => {
    const currentState = get();
    console.log('🚪 Logout called - clearing auth state', {
      hadToken: !!currentState.accessToken,
      hadRefreshToken: !!currentState.refreshToken,
      userId: currentState.userId,
    });
    
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
    
    // Verify state was cleared
    const clearedState = get();
    console.log('✅ Logout complete - state cleared:', {
      accessToken: clearedState.accessToken,
      refreshToken: clearedState.refreshToken,
    });
    
    void trackEvent('logout');
    void unregisterPushNotifications();
  },
});

const persistOptions: AuthPersist = {
  name: 'heka-auth-store',
  storage: {
    getItem: async (name) => {
      try {
        console.log('📂 Loading auth state from AsyncStorage...');
        const str = await AsyncStorage.getItem(name);
        if (str) {
          const parsed = JSON.parse(str);
          console.log('📂 Auth state loaded from storage:', {
            hasAccessToken: !!parsed?.state?.accessToken,
            hasRefreshToken: !!parsed?.state?.refreshToken,
            refreshTokenPreview: parsed?.state?.refreshToken ? `${parsed.state.refreshToken.substring(0, 20)}...` : 'null',
          });
          return parsed;
        }
        console.log('📂 No auth state found in storage');
        return null;
      } catch (e) {
        console.error('❌ Failed to load state from AsyncStorage', e);
        return null;
      }
    },
    setItem: async (name, value) => {
      try {
        const state = typeof value === 'string' ? JSON.parse(value) : value;
        console.log('💾 Saving auth state to AsyncStorage:', {
          hasAccessToken: !!state?.state?.accessToken,
          hasRefreshToken: !!state?.state?.refreshToken,
          refreshTokenPreview: state?.state?.refreshToken ? `${state.state.refreshToken.substring(0, 20)}...` : 'null',
        });
        await AsyncStorage.setItem(name, JSON.stringify(value));
        console.log('✅ Auth state saved to AsyncStorage');
      } catch (e) {
        console.error('❌ Failed to save state to AsyncStorage', e);
      }
    },
    removeItem: (name) => {
      console.log('🗑️ Removing auth state from AsyncStorage');
      return AsyncStorage.removeItem(name);
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
      console.error('❌ Rehydration error:', error);
      useAuthStore.setState({ _hasHydrated: true });
      return;
    }
    console.log('🔄 Rehydrating auth store from AsyncStorage...');
    if (state) {
      console.log('📦 Rehydrated state:', {
        hasAccessToken: !!state.accessToken,
        hasRefreshToken: !!state.refreshToken,
        refreshTokenPreview: state.refreshToken ? `${state.refreshToken.substring(0, 20)}...` : 'null',
        email: state.email,
        userId: state.userId,
      });
      if (state.accessToken) {
        setAuthToken(state.accessToken);
        console.log('✅ Auth token restored from storage and set in API client');
      } else {
        console.warn('⚠️ No access token in rehydrated state');
      }
      if (!state.refreshToken) {
        console.warn('⚠️ WARNING: No refresh token in rehydrated state!');
      }
    } else {
      console.log('📦 No state to rehydrate (first launch)');
    }
    // Mark rehydration as complete
    useAuthStore.setState({ _hasHydrated: true });
    console.log('✅ Rehydration complete');
  },
};

export const useAuthStore = create<AuthStore>()(persist(createAuthStore, persistOptions));


