import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/auth';

// Using production backend - local debugging requires network setup (tunnel/port forwarding)
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://heka-production.up.railway.app';

console.log('🔌 API Client initialized with URL:', API_BASE_URL);

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const normalizeAuthHeader = (value: unknown): string | undefined =>
  typeof value === 'string'
    ? value
    : Array.isArray(value) && typeof value[0] === 'string'
    ? value[0]
    : undefined;

// Request interceptor to log headers and ensure latest token is used
api.interceptors.request.use(
  (config) => {
    // CRITICAL: Always use the latest token from store for requests
    // This ensures we don't use stale tokens, especially after refresh
    const authStore = useAuthStore.getState();
    if (authStore.accessToken) {
      // Always override with latest token to prevent stale token issues
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${authStore.accessToken}`;
    }
    
    const authHeader = normalizeAuthHeader(config.headers?.Authorization);
    const isRetry = !!(config as InternalAxiosRequestConfig & { _retry?: boolean })?._retry;
    console.log(`🌐 ${config.method?.toUpperCase()} ${config.url}`, {
      hasAuth: !!authHeader,
      authPreview: authHeader ? `${authHeader.substring(0, 30)}...` : 'none',
      isRetry,
      tokenFromStore: authStore.accessToken ? `${authStore.accessToken.substring(0, 20)}...` : 'none',
      tokensMatch: authHeader && authStore.accessToken 
        ? authHeader.includes(authStore.accessToken.substring(0, 20))
        : 'N/A',
    });
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 and refresh tokens
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Log all 401 errors for debugging
    if (error.response?.status === 401) {
      console.log('🔴 401 Error detected:', {
        url: error.config?.url,
        hasConfig: !!error.config,
        hasOriginalRequest: !!error.config,
        isRetry: !!(error.config as InternalAxiosRequestConfig & { _retry?: boolean })?._retry,
        errorType: error.constructor.name,
        responseStatus: error.response?.status,
        responseData: error.response?.data,
      });
    }

    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Check condition with detailed logging
    const is401 = error.response?.status === 401;
    const hasConfig = !!originalRequest;
    const isNotRetry = !originalRequest?._retry;
    const conditionMet = is401 && hasConfig && isNotRetry;

    console.log('🔍 Interceptor condition check:', {
      is401,
      hasConfig,
      isNotRetry,
      conditionMet,
      url: originalRequest?.url,
    });

    if (conditionMet) {
      // Skip refresh for auth endpoints and logout operations
      if (
        originalRequest.url?.includes('/api/auth/') ||
        originalRequest.url?.includes('/api/notifications/device')
      ) {
        console.error('🚫 401 Unauthorized (skipping refresh):', originalRequest.url);
        return Promise.reject(error);
      }

      // Check if we have a refresh token before attempting refresh
      const authStore = useAuthStore.getState();
      console.log('🔍 Checking for refresh token before refresh attempt:', {
        hasRefreshToken: !!authStore.refreshToken,
        refreshTokenPreview: authStore.refreshToken ? `${authStore.refreshToken.substring(0, 20)}...` : 'null',
        hasAccessToken: !!authStore.accessToken,
        userId: authStore.userId,
        email: authStore.email,
      });
      
      if (!authStore.refreshToken) {
        console.error('🚫 No refresh token available, cannot refresh');
        console.error('Current auth store state:', {
          accessToken: authStore.accessToken ? 'present' : 'missing',
          refreshToken: authStore.refreshToken ? 'present' : 'missing',
          email: authStore.email,
          userId: authStore.userId,
        });
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('🔄 Attempting token refresh...');
        const authStore = useAuthStore.getState();
        await authStore.refreshSession();
        const newToken = useAuthStore.getState().accessToken;

        if (newToken) {
          console.log('✅ Token refreshed successfully');
          setAuthToken(newToken);
          processQueue(null, newToken);

          // CRITICAL: Create a fresh request config with the new token
          // Don't reuse originalRequest as it may have cached headers
          const newRequestConfig = {
            ...originalRequest,
            headers: {
              ...originalRequest.headers,
              Authorization: `Bearer ${newToken}`,
            },
            _retry: true, // Mark as retry to prevent infinite loop
          };
          
          console.log('🔄 Retrying original request with new token:', {
            url: newRequestConfig.url,
            hasNewToken: !!newToken,
            tokenPreview: newToken ? `${newToken.substring(0, 20)}...` : 'none',
          });
          
          return api(newRequestConfig);
        } else {
          throw new Error('No token after refresh');
        }
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        processQueue(refreshError as Error, null);
        
        // Only logout if we're not in the middle of a login operation
        const authStore = useAuthStore.getState();
        if (!authStore.loading) {
          console.log('🔄 Refresh failed, calling logout (not during login)');
          authStore.logout();
        } else {
          console.log('⏸️ Refresh failed but login in progress, skipping logout');
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Log 401 errors that didn't trigger refresh (for debugging)
    if (error.response?.status === 401) {
      const reason = !hasConfig
        ? 'no config'
        : originalRequest?._retry
        ? 'already retried'
        : 'condition not met';
      console.error('🚫 401 Unauthorized (not handled):', {
        url: originalRequest?.url || error.config?.url,
        reason,
        hasAuthHeader: !!normalizeAuthHeader(originalRequest?.headers?.Authorization || error.config?.headers?.Authorization),
        authHeader: (() => {
          const header = normalizeAuthHeader(originalRequest?.headers?.Authorization || error.config?.headers?.Authorization);
          return header ? `${header.substring(0, 30)}...` : 'none';
        })(),
      });
    }

    return Promise.reject(error);
  }
);

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    console.log('🔐 Authorization header set:', `Bearer ${token.substring(0, 20)}...`);
  } else {
    delete api.defaults.headers.common.Authorization;
    console.log('🔓 Authorization header cleared');
  }
};
