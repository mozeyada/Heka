import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import * as Sentry from '@sentry/react-native';
import { useAuthStore } from '../src/store/auth';
import { registerSentry } from '../src/services/sentry';
import { initializeMixpanel } from '../src/services/analytics';
import { registerForPushNotifications } from '../src/services/notifications';

const AUTHENTICATED_ROUTES = new Set(['(tabs)']);

function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { accessToken, _hasHydrated } = useAuthStore();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    registerSentry();
    void initializeMixpanel();
  }, []);

  useEffect(() => {
    if (accessToken) {
      registerForPushNotifications().catch((error) => {
        Sentry.captureException(error);
      });
    }
  }, [accessToken]);

  useEffect(() => {
    // Log navigation guard state for debugging
    const authStore = useAuthStore.getState();
    console.log('🧭 Navigation guard effect triggered:', {
      hasAccessToken: !!accessToken,
      storeHasToken: !!authStore.accessToken,
      hasHydrated: _hasHydrated,
      hasNavKey: !!rootNavigationState?.key,
      segmentsLength: segments.length,
      segments: segments.join('/') || '(empty)',
      loading: authStore.loading,
    });
    
    // CRITICAL: Wait for rehydration AND ensure we're not in the middle of login
    if (!rootNavigationState?.key || !_hasHydrated || authStore.loading) {
      console.log('⏳ Navigation guard: waiting', {
        hasNavKey: !!rootNavigationState?.key,
        hasHydrated: _hasHydrated,
        isLoading: authStore.loading,
      });
      return;
    }

    // Double-check token from store (more reliable than hook value during state transitions)
    const currentToken = authStore.accessToken;
    
    // Determine current route
    // If segments is empty, we're likely at root (login screen)
    const currentRoute = segments.length > 0 ? segments[0] : '';
    const inSecureArea = currentRoute === '(tabs)';
    const isRootOrLogin = currentRoute === '' || currentRoute === 'index';
    const isAuthenticatedRoute = inSecureArea || (currentToken && !isRootOrLogin);
    
    console.log('🧭 Navigation guard check:', { 
      hasToken: !!currentToken,
      hookHasToken: !!accessToken,
      inSecureArea, 
      isRootOrLogin,
      isAuthenticatedRoute,
      currentRoute: currentRoute || '(root)',
      segments: segments.join('/') || '(empty)',
      willRedirect: (!currentToken && inSecureArea) || (currentToken && isRootOrLogin),
    });

    // Use setTimeout to ensure navigation container is fully mounted
    const timeoutId = setTimeout(() => {
      try {
        // Re-check token from store right before navigation (defensive)
        const finalToken = useAuthStore.getState().accessToken;
        
        // Only redirect if:
        // 1. No token but trying to access secure area (tabs) → go to login
        // 2. Has token but on root/login screen → go to dashboard
        // DO NOT redirect if has token and navigating to detail routes (like /argument)
        if (!finalToken && inSecureArea) {
          console.log('🚪 Redirecting to login (no token, in secure area)');
          router.replace('/');
        } else if (finalToken && isRootOrLogin) {
          console.log('🔄 Redirecting to dashboard (has token, on login screen)');
          router.replace('/(tabs)/dashboard');
        }
        // Otherwise, allow navigation (detail routes, etc.)
      } catch (error) {
        console.warn('⚠️ Navigation error (will retry):', error);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [accessToken, segments, rootNavigationState?.key, router, _hasHydrated]);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}

export default Sentry.wrap(RootLayout);

